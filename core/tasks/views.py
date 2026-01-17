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
from .utils import log_activity


# -------------------------
# STATUS → COLUMN MAP
# -------------------------
STATUS_TO_COLUMN = {
    "TODO": "To Do",
    "IN_PROGRESS": "In Progress",
    "DONE": "Done",
}


# -------------------------
# SPRINT (READ ONLY)
# -------------------------
class SprintViewSet(ReadOnlyModelViewSet):
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
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
        return TaskList.objects.filter(
            board__project__workspace__workspacemember__user=self.request.user
        ).distinct()


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
        return Task.objects.filter(
            task_list__board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

    # -------------------------
    # CREATE TASK → PLACE IN COLUMN BASED ON STATUS
    # -------------------------
    def perform_create(self, serializer):
        user = self.request.user
        status_value = serializer.validated_data.get("status", "TODO")

        column_title = STATUS_TO_COLUMN.get(status_value)
        if not column_title:
            raise ValidationError("Invalid task status")

        task_list = TaskList.objects.filter(
            title__iexact=column_title,
            board__project__workspace__workspacemember__user=user
        ).first()

        if not task_list:
            raise ValidationError(
                f"Task list '{column_title}' not found. Ensure default columns exist."
            )

        task = serializer.save(
            created_by=user,
            task_list=task_list
        )

        log_activity(
            user=user,
            action="created task",
            entity_type="Task",
            entity_id=task.id
        )

    # -------------------------
    # UPDATE TASK → MOVE BETWEEN COLUMNS IF STATUS CHANGES
    # -------------------------
    def perform_update(self, serializer):
        task = serializer.save()

        if "status" in serializer.validated_data:
            status_value = serializer.validated_data["status"]
            column_title = STATUS_TO_COLUMN.get(status_value)

            if not column_title:
                raise ValidationError("Invalid task status")

            new_task_list = TaskList.objects.filter(
                title__iexact=column_title,
                board=task.task_list.board
            ).first()

            if not new_task_list:
                raise ValidationError(
                    f"Task list '{column_title}' not found for this board"
                )

            if task.task_list_id != new_task_list.id:
                task.task_list = new_task_list
                task.save(update_fields=["task_list"])

        log_activity(
            user=self.request.user,
            action="updated task",
            entity_type="Task",
            entity_id=task.id
        )


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
        task = serializer.validated_data["task"]
        user_to_assign = serializer.validated_data["user"]
        workspace = task.task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=user_to_assign,
            workspace=workspace
        ).exists():
            raise PermissionDenied("User is not a workspace member")

        assignee = serializer.save()

        log_activity(
            user=self.request.user,
            action="assigned user",
            entity_type="Task",
            entity_id=assignee.task.id
        )


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
        task = serializer.validated_data["task"]
        workspace = task.task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=self.request.user,
            workspace=workspace
        ).exists():
            raise PermissionDenied("Not a workspace member")

        comment = serializer.save(user=self.request.user)

        log_activity(
            user=self.request.user,
            action="commented on task",
            entity_type="Task",
            entity_id=comment.task.id
        )


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
