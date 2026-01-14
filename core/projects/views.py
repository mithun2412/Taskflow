from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Workspace, WorkspaceMember, Project, Board
from .serializers import (
    WorkspaceSerializer,
    ProjectSerializer,
    BoardSerializer,
)

# -------------------------
# WORKSPACE
# -------------------------
class WorkspaceViewSet(ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    # ✅ All users can VIEW workspaces they belong to
    def get_queryset(self):
        return Workspace.objects.filter(
            workspacemember__user=self.request.user
        ).distinct()

    # ❌ ONLY DJANGO SUPERUSER CAN CREATE WORKSPACE
    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create workspaces")

        workspace = serializer.save(owner=self.request.user)

        # creator automatically becomes member
        WorkspaceMember.objects.create(
            user=self.request.user,
            workspace=workspace
        )


# -------------------------
# PROJECT
# -------------------------
class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    # ✅ All users can VIEW projects
    def get_queryset(self):
        return Project.objects.filter(
            workspace__workspacemember__user=self.request.user
        ).distinct()

    # ❌ ONLY DJANGO SUPERUSER CAN CREATE PROJECT
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

    # ✅ All users can VIEW boards
    def get_queryset(self):
        return Board.objects.filter(
            project__workspace__workspacemember__user=self.request.user
        ).distinct()

    # ❌ ONLY DJANGO SUPERUSER CAN CREATE BOARD
    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create boards")

        serializer.save()
