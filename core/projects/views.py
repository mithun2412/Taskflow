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
# PERMISSION HELPER
# =========================
def is_workspace_admin(user, workspace):
    """
    Returns True if the user is a superuser OR an ADMIN member of the workspace.
    Pass workspace as a Workspace instance or workspace_id (int/str).
    """
    if user.is_superuser:
        return True

    if isinstance(workspace, Workspace):
        workspace_id = workspace.pk
    else:
        workspace_id = workspace

    return WorkspaceMember.objects.filter(
        user=user,
        workspace_id=workspace_id,
        role="ADMIN",
    ).exists()


# =========================
# WORKSPACE
# =========================
class WorkspaceViewSet(ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Each user only sees workspaces they are a member of
        return Workspace.objects.filter(
            workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        # Only superusers can create workspaces
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only superadmins can create workspaces.")

        workspace = serializer.save(owner=self.request.user)

        # Creator automatically becomes ADMIN member
        WorkspaceMember.objects.get_or_create(
            workspace=workspace,
            user=self.request.user,
            defaults={"role": "ADMIN"},
        )

    def perform_update(self, serializer):
        workspace = self.get_object()
        if not is_workspace_admin(self.request.user, workspace):
            raise PermissionDenied("Only workspace admins can update this workspace.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_workspace_admin(self.request.user, instance):
            raise PermissionDenied("Only workspace admins can delete this workspace.")
        instance.delete()


# =========================
# PROJECT (TEAM)
# =========================
class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        # Only projects belonging to workspaces the user is a member of
        qs = Project.objects.filter(
            workspace__workspacemember__user=self.request.user
        )

        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)

        return qs.distinct()

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace")
        if not is_workspace_admin(self.request.user, workspace_id):
            raise PermissionDenied("Only workspace admins can create projects.")
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        project = self.get_object()
        if not is_workspace_admin(self.request.user, project.workspace):
            raise PermissionDenied("Only workspace admins can update projects.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_workspace_admin(self.request.user, instance.workspace):
            raise PermissionDenied("Only workspace admins can delete projects.")
        instance.delete()


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
        project_id = self.request.data.get("project")
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise PermissionDenied("Project not found.")

        if not is_workspace_admin(self.request.user, project.workspace):
            raise PermissionDenied("Only workspace admins can create boards.")

        board = serializer.save()

        # Auto-create default Kanban columns
        TaskList.objects.bulk_create(
            [
                TaskList(board=board, title="To Do",       position=1),
                TaskList(board=board, title="In Progress", position=2),
                TaskList(board=board, title="In Review",   position=3),
                TaskList(board=board, title="Done",        position=4),
            ],
            ignore_conflicts=True,
        )

    def perform_update(self, serializer):
        board = self.get_object()
        if not is_workspace_admin(self.request.user, board.project.workspace):
            raise PermissionDenied("Only workspace admins can update boards.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_workspace_admin(self.request.user, instance.project.workspace):
            raise PermissionDenied("Only workspace admins can delete boards.")
        instance.delete()


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

        # Only visible to members of that workspace
        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            workspace__workspacemember__user=self.request.user,
        ).select_related("user").distinct()


# =========================
# SEARCH USER BY EMAIL (before adding)
# GET /workspaces/search-user/?q=<email>&workspace=<id>
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_user_for_invite(request):
    """
    Search registered users by email to invite them to a workspace.
    Only workspace admins can search. Already-added members are excluded.
    """
    query        = request.query_params.get("q", "").strip()
    workspace_id = request.query_params.get("workspace", "").strip()

    if not query:
        return Response({"error": "Search query 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not workspace_id:
        return Response({"error": "'workspace' param is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not is_workspace_admin(request.user, workspace_id):
        return Response({"error": "Only workspace admins can search for invites."}, status=status.HTTP_403_FORBIDDEN)

    # Find matching users who are NOT already in the workspace
    users = (
        User.objects.filter(email__icontains=query)
        .exclude(workspacemember__workspace_id=workspace_id)
        .order_by("email")[:5]
    )

    return Response([
        {"id": u.id, "email": u.email, "username": u.username}
        for u in users
    ])


# =========================
# ADD WORKSPACE MEMBER (with role)
# POST /workspaces/add-member/
# Body: { workspace, email, role }
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_workspace_member(request):
    workspace_id = request.data.get("workspace")
    email        = request.data.get("email")
    role         = request.data.get("role", "MEMBER").strip().upper()

    # --- Basic validation ---
    if not workspace_id or not email:
        return Response(
            {"error": "Both 'workspace' and 'email' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    VALID_ROLES = {"ADMIN", "MEMBER"}
    if role not in VALID_ROLES:
        return Response(
            {"error": f"Invalid role '{role}'. Must be one of: {', '.join(VALID_ROLES)}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --- Workspace must exist ---
    try:
        workspace = Workspace.objects.get(id=workspace_id)
    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found."}, status=status.HTTP_404_NOT_FOUND)

    # --- Only workspace admins can add members ---
    if not is_workspace_admin(request.user, workspace):
        return Response(
            {"error": "Only workspace admins can add members."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # --- Target user must be registered ---
    try:
        user = User.objects.get(email__iexact=email.strip().lower())
    except User.DoesNotExist:
        return Response(
            {"error": "No registered user found with this email."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # --- Cannot add someone who is already a member ---
    if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
        return Response(
            {"error": "This user is already a member of the workspace."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --- Create membership ---
    member = WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role=role,
    )

    return Response(
        {
            "message": f"User added as {role} successfully.",
            "member": {
                "id":       member.id,
                "user_id":  user.id,
                "email":    user.email,
                "username": user.username,
                "role":     member.role,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================
# UPDATE MEMBER ROLE
# PATCH /workspaces/update-member-role/
# Body: { member_id, role }
# =========================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_member_role(request):
    member_id = request.data.get("member_id")
    role      = request.data.get("role", "").strip().upper()

    if not member_id or not role:
        return Response(
            {"error": "Both 'member_id' and 'role' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    VALID_ROLES = {"ADMIN", "MEMBER"}
    if role not in VALID_ROLES:
        return Response(
            {"error": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        member = WorkspaceMember.objects.select_related("workspace", "user").get(pk=member_id)
    except WorkspaceMember.DoesNotExist:
        return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

    if not is_workspace_admin(request.user, member.workspace):
        return Response(
            {"error": "Only workspace admins can change member roles."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Prevent demoting the last admin
    if role == "MEMBER" and member.role == "ADMIN":
        admin_count = WorkspaceMember.objects.filter(
            workspace=member.workspace, role="ADMIN"
        ).count()
        if admin_count <= 1:
            return Response(
                {"error": "Cannot demote the last admin of a workspace."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    member.role = role
    member.save(update_fields=["role"])

    return Response(
        {
            "message": f"Role updated to {role}.",
            "member": {
                "id":       member.id,
                "user_id":  member.user.id,
                "email":    member.user.email,
                "username": member.user.username,
                "role":     member.role,
            },
        }
    )


# =========================
# REMOVE WORKSPACE MEMBER
# DELETE /workspaces/remove-member/
# Body: { member_id }
# =========================
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_workspace_member(request):
    member_id = request.data.get("member_id")

    if not member_id:
        return Response({"error": "'member_id' is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        member = WorkspaceMember.objects.select_related("workspace", "user").get(pk=member_id)
    except WorkspaceMember.DoesNotExist:
        return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

    if not is_workspace_admin(request.user, member.workspace):
        return Response(
            {"error": "Only workspace admins can remove members."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Prevent removing the last admin
    if member.role == "ADMIN":
        admin_count = WorkspaceMember.objects.filter(
            workspace=member.workspace, role="ADMIN"
        ).count()
        if admin_count <= 1:
            return Response(
                {"error": "Cannot remove the last admin of a workspace."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    member.delete()
    return Response({"message": "Member removed successfully."}, status=status.HTTP_200_OK)