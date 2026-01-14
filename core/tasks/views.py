from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    Task,
    TaskList,
    TaskAssignee,
    Comment,
    ActivityLog,
)
from .serializers import (
    TaskSerializer,
    TaskListSerializer,
    TaskAssigneeSerializer,
    CommentSerializer,
    ActivityLogSerializer,
)

from projects.models import WorkspaceMember
from .utils import log_activity


# -------------------------
# TASK LIST (COLUMNS)
# -------------------------
class TaskListViewSet(ModelViewSet):
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

    # ✅ Users + Admins can VIEW task lists
    def get_queryset(self):
        return TaskList.objects.filter(
            board__project__workspace__workspacemember__user=self.request.user
        )


# -------------------------
# TASK (CARD)
# -------------------------
class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    # ✅ Users + Admins can VIEW tasks
    def get_queryset(self):
        return Task.objects.filter(
            task_list__board__project__workspace__workspacemember__user=self.request.user
        ).distinct()

    # ✅ USERS + ADMINS CAN CREATE TASKS
    def perform_create(self, serializer):
        task_list = serializer.validated_data["task_list"]
        workspace = task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=self.request.user,
            workspace=workspace
        ).exists():
            raise PermissionDenied("Not a workspace member")

        task = serializer.save(created_by=self.request.user)

        log_activity(
            user=self.request.user,
            action="created task",
            entity_type="Task",
            entity_id=task.id
        )

    # ✅ USERS + ADMINS CAN UPDATE TASKS
    def perform_update(self, serializer):
        task = serializer.save()

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
        )

    # ✅ USERS + ADMINS CAN ASSIGN TASKS
    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        user = serializer.validated_data["user"]
        workspace = task.task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=user,
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
        )

    # ✅ USERS + ADMINS CAN COMMENT
    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        workspace = task.task_list.board.project.workspace

        if not WorkspaceMember.objects.filter(
            user=self.request.user,
            workspace=workspace
        ).exists():
            raise PermissionDenied("You are not a workspace member")

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
