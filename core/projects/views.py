from django.contrib.auth.models import User

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes

from .models import Workspace, WorkspaceMember, Project, Board
from .serializers import (
    WorkspaceSerializer,
    ProjectSerializer,
    BoardSerializer,
    WorkspaceMemberSerializer,
)

from tasks.models import TaskList


# =========================
# WORKSPACE
# =========================
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

        # 🔥 creator becomes ADMIN
        WorkspaceMember.objects.get_or_create(
            workspace=workspace,
            user=self.request.user,
            defaults={"role": "ADMIN"},
        )


# =========================
# PROJECT (TEAM)
# =========================
class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        qs = Project.objects.filter(
            workspace__workspacemember__user=self.request.user
        )

        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)

        return qs.distinct()

    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only admins can create projects")

        serializer.save(created_by=self.request.user)


# =========================
# BOARD
# =========================
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

        # 🔥 default Kanban columns
        TaskList.objects.bulk_create(
            [
                TaskList(board=board, title="To Do", position=1),
                TaskList(board=board, title="In Progress", position=2),
                TaskList(board=board, title="In Review", position=3),
                TaskList(board=board, title="Done", position=4),
            ],
            ignore_conflicts=True,
        )


# =========================
# WORKSPACE MEMBERS (LIST)
# =========================
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
        ).select_related("user").distinct()


# =========================
# ADD WORKSPACE MEMBER
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_workspace_member(request):
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

    # ✅ only owner or superuser
    if workspace.owner != request.user and not request.user.is_superuser:
        return Response(
            {"error": "Only workspace owner can add members"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response(
            {"error": "User with this email does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )

    if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
        return Response(
            {"error": "User already added to this workspace"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 🔥 CRITICAL FIX: role MUST be set
    WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role="MEMBER"
    )

    return Response(
        {
            "message": "User added successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            }
        },
        status=status.HTTP_201_CREATED
    )
