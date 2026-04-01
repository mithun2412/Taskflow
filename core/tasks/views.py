from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import (
    Sprint,
    Task,
    TaskList,
    TaskAssignee,
    Comment,
    ActivityLog,
)
from .serializers import (
    SprintSerializer,
    TaskSerializer,
    TaskCreateSerializer,
    TaskListSerializer,
    TaskAssigneeSerializer,
    CommentSerializer,
    ActivityLogSerializer,
)

from projects.models import WorkspaceMember
from projects.permissions import is_workspace_admin  # ✅ clean, no cross-view import
from .utils import log_activity


# -------------------------
# STATUS → COLUMN MAP
# -------------------------
STATUS_TO_COLUMN = {
    "TODO":        "To Do",
    "IN_PROGRESS": "In Progress",
    "DONE":        "Done",
}


# -------------------------
# SPRINT (READ ONLY)
# -------------------------
class SprintViewSet(ReadOnlyModelViewSet):
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Visible only to members of the workspace the sprint belongs to
        return Sprint.objects.filter(
            board__project__workspace__workspacemember__user=self.request.user
        ).distinct()


# -------------------------
# TASK LIST (KANBAN COLUMNS)
# -------------------------
class TaskListViewSet(ReadOnlyModelViewSet):
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TaskList.objects.filter(
            board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

        board_id = self.request.query_params.get("board")
        if board_id:
            qs = qs.filter(board_id=board_id)

        return qs


# -------------------------
# TASK (KANBAN CARD)
# -------------------------
class TaskViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return TaskCreateSerializer
        return TaskSerializer

    def get_queryset(self):
        qs = Task.objects.filter(
            task_list__board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

        # Optional filters for board-scoped or column-scoped fetching
        board_id     = self.request.query_params.get("board")
        task_list_id = self.request.query_params.get("task_list")

        if board_id:
            qs = qs.filter(task_list__board_id=board_id)
        if task_list_id:
            qs = qs.filter(task_list_id=task_list_id)

        return qs

    # ── CREATE ────────────────────────────────────────────────────
    # Any workspace member (ADMIN or MEMBER) can create tasks
    def perform_create(self, serializer):
        user = self.request.user

        # ✅ Frontend must send task_list_id directly so we know
        # exactly which board/project this task belongs to.
        task_list_id = self.request.data.get("task_list_id")

        if task_list_id:
            # Use the exact column the frontend specified
            try:
                task_list = TaskList.objects.get(
                    pk=task_list_id,
                    board__project__workspace__workspacemember__user=user,
                )
            except TaskList.DoesNotExist:
                raise ValidationError("Task list not found or access denied.")
        else:
            # Fallback: match by status → column title (old behaviour)
            # This only works correctly if there's one board — kept for compatibility
            status_value = serializer.validated_data.get("status", "TODO")
            column_title = STATUS_TO_COLUMN.get(status_value)
            if not column_title:
                raise ValidationError("Invalid task status.")

            task_list = TaskList.objects.filter(
                title__iexact=column_title,
                board__project__workspace__workspacemember__user=user,
            ).first()

            if not task_list:
                raise ValidationError(
                    f"Task list '{column_title}' not found. "
                    "Pass task_list_id to specify the board explicitly."
                )

        task = serializer.save(
            created_by=user,
            task_list=task_list,
        )

        log_activity(
            user=user,
            action="created task",
            entity_type="Task",
            entity_id=task.id,
        )

    # ── UPDATE ────────────────────────────────────────────────────
    # Any workspace member can update tasks (move columns, edit fields)
    def perform_update(self, serializer):
        task = serializer.save()

        if "status" in serializer.validated_data:
            status_value = serializer.validated_data["status"]
            column_title = STATUS_TO_COLUMN.get(status_value)

            if not column_title:
                raise ValidationError("Invalid task status.")

            new_task_list = TaskList.objects.filter(
                title__iexact=column_title,
                board=task.task_list.board,
            ).first()

            if not new_task_list:
                raise ValidationError(
                    f"Task list '{column_title}' not found for this board."
                )

            if task.task_list_id != new_task_list.id:
                task.task_list = new_task_list
                task.save(update_fields=["task_list"])

        log_activity(
            user=self.request.user,
            action="updated task",
            entity_type="Task",
            entity_id=task.id,
        )

    # ── DELETE ────────────────────────────────────────────────────
    # Only workspace ADMINs can delete tasks
    def perform_destroy(self, instance):
        workspace = instance.task_list.board.project.workspace
        if not is_workspace_admin(self.request.user, workspace):
            raise PermissionDenied("Only workspace admins can delete tasks.")
        instance.delete()


# -------------------------
# TASK ASSIGNEE
# -------------------------
class TaskAssigneeViewSet(ModelViewSet):
    serializer_class = TaskAssigneeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskAssignee.objects.filter(
            task__task_list__board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        task            = serializer.validated_data["task"]
        user_to_assign  = serializer.validated_data["user"]
        workspace       = task.task_list.board.project.workspace

        # The person being assigned must already be a workspace member
        if not WorkspaceMember.objects.filter(
            user=user_to_assign,
            workspace=workspace,
        ).exists():
            raise PermissionDenied("Cannot assign a user who is not a workspace member.")

        assignee = serializer.save()

        log_activity(
            user=self.request.user,
            action="assigned user",
            entity_type="Task",
            entity_id=assignee.task.id,
        )

    # Only ADMINs can remove assignees
    def perform_destroy(self, instance):
        workspace = instance.task.task_list.board.project.workspace
        if not is_workspace_admin(self.request.user, workspace):
            raise PermissionDenied("Only workspace admins can remove assignees.")
        instance.delete()


# -------------------------
# COMMENTS
# -------------------------
class CommentViewSet(ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            task__task_list__board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        task      = serializer.validated_data["task"]
        workspace = task.task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=self.request.user,
            workspace=workspace,
        ).exists():
            raise PermissionDenied("Not a workspace member.")

        comment = serializer.save(user=self.request.user)

        log_activity(
            user=self.request.user,
            action="commented on task",
            entity_type="Task",
            entity_id=comment.task.id,
        )

    # Users can only delete their own comments; ADMINs can delete any
    def perform_destroy(self, instance):
        workspace = instance.task.task_list.board.project.workspace
        is_own    = instance.user == self.request.user
        is_admin  = is_workspace_admin(self.request.user, workspace)

        if not is_own and not is_admin:
            raise PermissionDenied("You can only delete your own comments.")

        instance.delete()


# -------------------------
# ACTIVITY LOG (READ ONLY)
# -------------------------
class ActivityLogViewSet(ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(
            user__workspacemember__workspace__workspacemember__user=self.request.user
        ).distinct()