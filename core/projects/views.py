from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

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
# EMAIL HELPER
# =========================
def send_workspace_invite_email(inviter, invitee, workspace, role):
    """
    Sends a workspace invitation email to the invitee.
    Falls back silently if email is misconfigured — never breaks the invite flow.
    """
    subject = f"{inviter.username} invited you to '{workspace.name}' on TaskFlow"

    # Fetch all projects in this workspace to list them in the email
    projects = Project.objects.filter(workspace=workspace).values_list("name", flat=True)
    project_list = ", ".join(projects) if projects else "No projects yet"

    # Plain-text version
    plain_message = f"""Hi {invitee.username},

{inviter.username} ({inviter.email}) has invited you to join the workspace "{workspace.name}" on TaskFlow as a {role}.

Workspace: {workspace.name}
Your role:  {role}
Projects:   {project_list}

Log in to TaskFlow to get started:
{getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')}

If you didn't expect this invitation, you can safely ignore this email.

— The TaskFlow Team
"""

    # HTML version
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background: #0d0f16; font-family: 'Segoe UI', Arial, sans-serif; }}
    .wrapper {{ max-width: 560px; margin: 40px auto; background: #13151f; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }}
    .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 36px 28px; }}
    .logo {{ font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }}
    .logo span {{ opacity: 0.7; font-weight: 400; }}
    .header-sub {{ font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px; }}
    .body {{ padding: 32px 36px; }}
    .greeting {{ font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; }}
    .desc {{ font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 28px; }}
    .desc strong {{ color: rgba(255,255,255,0.85); }}
    .card {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }}
    .card-row {{ display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }}
    .card-row:last-child {{ margin-bottom: 0; }}
    .card-label {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.25); width: 70px; flex-shrink: 0; padding-top: 2px; }}
    .card-value {{ font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500; }}
    .badge {{ display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
              background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; }}
    .cta {{ display: block; text-align: center; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700;
            letter-spacing: -0.2px; margin-bottom: 28px; }}
    .footer {{ padding: 20px 36px 28px; border-top: 1px solid rgba(255,255,255,0.06); }}
    .footer-text {{ font-size: 12px; color: rgba(255,255,255,0.2); line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">⚡ TaskFlow</div>
      <div class="header-sub">Workspace Invitation</div>
    </div>
    <div class="body">
      <div class="greeting">You're invited, {invitee.username}! 🎉</div>
      <p class="desc">
        <strong>{inviter.username}</strong> ({inviter.email}) has invited you to join
        the <strong>{workspace.name}</strong> workspace on TaskFlow
        as a <strong>{role}</strong>.
      </p>

      <div class="card">
        <div class="card-row">
          <div class="card-label">Workspace</div>
          <div class="card-value">{workspace.name}</div>
        </div>
        <div class="card-row">
          <div class="card-label">Your role</div>
          <div class="card-value"><span class="badge">{role}</span></div>
        </div>
        <div class="card-row">
          <div class="card-label">Projects</div>
          <div class="card-value">{project_list}</div>
        </div>
        <div class="card-row">
          <div class="card-label">Invited by</div>
          <div class="card-value">{inviter.username} &lt;{inviter.email}&gt;</div>
        </div>
      </div>

      <a class="cta" href="{getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')}">
        Open TaskFlow →
      </a>
    </div>
    <div class="footer">
      <div class="footer-text">
        If you didn't expect this invitation, you can safely ignore this email.<br>
        You're receiving this because {inviter.email} added you to a TaskFlow workspace.
      </div>
    </div>
  </div>
</body>
</html>
"""

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitee.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        # Log but don't crash — member was already added successfully
        print(f"[TaskFlow] Invite email failed for {invitee.email}: {e}")


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
            raise PermissionDenied("Only superadmins can create workspaces.")
        workspace = serializer.save(owner=self.request.user)
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
# PROJECT
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
        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            workspace__workspacemember__user=self.request.user,
        ).select_related("user").distinct()


# =========================
# SEARCH USER FOR INVITE
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_user_for_invite(request):
    query        = request.query_params.get("q", "").strip()
    workspace_id = request.query_params.get("workspace", "").strip()

    if not query:
        return Response({"error": "Search query 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not workspace_id:
        return Response({"error": "'workspace' param is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not is_workspace_admin(request.user, workspace_id):
        return Response({"error": "Only workspace admins can search for invites."}, status=status.HTTP_403_FORBIDDEN)

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
# ADD WORKSPACE MEMBER  ✅ now sends invite email
# POST /api/add-workspace-member/
# Body: { workspace, email, role }
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_workspace_member(request):
    workspace_id = request.data.get("workspace")
    email        = request.data.get("email")
    role         = request.data.get("role", "MEMBER").strip().upper()

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

    try:
        workspace = Workspace.objects.get(id=workspace_id)
    except Workspace.DoesNotExist:
        return Response({"error": "Workspace not found."}, status=status.HTTP_404_NOT_FOUND)

    if not is_workspace_admin(request.user, workspace):
        return Response(
            {"error": "Only workspace admins can add members."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        user = User.objects.get(email__iexact=email.strip().lower())
    except User.DoesNotExist:
        return Response(
            {"error": "No registered user found with this email."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
        return Response(
            {"error": "This user is already a member of the workspace."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    member = WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role=role,
    )

    # ✅ Send invite email (non-blocking — errors are logged, not raised)
    send_workspace_invite_email(
        inviter=request.user,
        invitee=user,
        workspace=workspace,
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

    return Response({
        "message": f"Role updated to {role}.",
        "member": {
            "id":       member.id,
            "user_id":  member.user.id,
            "email":    member.user.email,
            "username": member.user.username,
            "role":     member.role,
        },
    })


# =========================
# REMOVE WORKSPACE MEMBER
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