from rest_framework.permissions import BasePermission
from .models import WorkspaceMember


class IsWorkspaceMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj
        ).exists()


class IsWorkspaceAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
            role="ADMIN"
        ).exists()
