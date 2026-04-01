from rest_framework.permissions import BasePermission
from .models import Workspace, WorkspaceMember


# =========================
# DRF PERMISSION CLASSES
# (used with permission_classes=[...] on views)
# =========================

class IsWorkspaceMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
        ).exists()


class IsWorkspaceAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
            role="ADMIN",
        ).exists()


# =========================
# HELPER FUNCTION
# (used inline inside perform_create / perform_destroy etc.)
# =========================

def is_workspace_admin(user, workspace):
    """
    Returns True if the user is a superuser OR an ADMIN member of the workspace.
    Accepts either a Workspace instance or a workspace id (int / str).
    """
    if user.is_superuser:
        return True

    workspace_id = workspace.pk if isinstance(workspace, Workspace) else workspace

    return WorkspaceMember.objects.filter(
        user=user,
        workspace_id=workspace_id,
        role="ADMIN",
    ).exists()