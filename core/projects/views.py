from django.contrib.auth.models import User
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet, ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status

from .models import Workspace, WorkspaceMember, Project, Board
from .serializers import (
    WorkspaceSerializer,
    ProjectSerializer,
    BoardSerializer,
    WorkspaceMemberSerializer,
)

from tasks.models import TaskList   # 🔥 REQUIRED FOR TASK CREATION


# -------------------------
# WORKSPACE
# -------------------------
class WorkspaceViewSet(ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(
            workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create workspaces")

        workspace = serializer.save(owner=self.request.user)

        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
        )


# -------------------------
# PROJECT (USED AS TEAM)
# -------------------------
class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        queryset = Project.objects.filter(
            workspace__workspacemember__user=self.request.user
        )

        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)

        return queryset.distinct()

    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create projects")

        serializer.save(created_by=self.request.user)


# -------------------------
# BOARD
# -------------------------
class BoardViewSet(ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Board.objects.filter(
            project__workspace__workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create boards")

        board = serializer.save()

        # 🔥 AUTO-CREATE ALL REQUIRED TASK LISTS
        TaskList.objects.bulk_create([
            TaskList(board=board, title="To Do", position=1),
            TaskList(board=board, title="In Progress", position=2),
            TaskList(board=board, title="In Review", position=3),
            TaskList(board=board, title="Done", position=4),
        ])


# -------------------------
# WORKSPACE MEMBERS (LIST)
# -------------------------
class WorkspaceMemberViewSet(ReadOnlyModelViewSet):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        if not workspace_id:
            return WorkspaceMember.objects.none()

        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            workspace__workspacemember__user=self.request.user
        )


# -------------------------
# ADD MEMBER (ADMIN ONLY)
# -------------------------
class AddWorkspaceMemberViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        workspace_id = request.data.get("workspace")
        email = request.data.get("email")

        if not workspace_id or not email:
            return Response(
                {"error": "workspace and email are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = email.strip().lower()

        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response(
                {"error": "Workspace not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_superuser:
            raise PermissionDenied("Only admins can add members")

        users = User.objects.filter(email__iexact=email)

        if not users.exists():
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )

        if users.count() > 1:
            return Response(
                {"error": "Multiple users found with this email"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = users.first()

        if WorkspaceMember.objects.filter(
            workspace=workspace, user=user
        ).exists():
            return Response(
                {"error": "User already added to this workspace"},
                status=status.HTTP_400_BAD_REQUEST
            )

        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
        )

        return Response(
            {"message": "User added successfully"},
            status=status.HTTP_201_CREATED
        )
