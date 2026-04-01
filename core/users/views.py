from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet

from .serializers import RegisterSerializer, UserSerializer
from projects.models import WorkspaceMember


# =========================
# REGISTER
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# CURRENT USER
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        "id":         request.user.id,
        "username":   request.user.username,
        "email":      request.user.email,
        "is_superuser": request.user.is_superuser,
    })


# =========================
# WORKSPACE USERS (for task assignee dropdowns)
# GET /api/users/?workspace=<id>
# Returns only members of the given workspace — scoped to caller's memberships
# =========================
class WorkspaceUserViewSet(ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        if not workspace_id:
            return User.objects.none()

        # Caller must themselves be a member of the requested workspace
        caller_is_member = WorkspaceMember.objects.filter(
            user=self.request.user,
            workspace_id=workspace_id,
        ).exists()

        if not caller_is_member:
            return User.objects.none()

        return (
            User.objects.filter(workspacemember__workspace_id=workspace_id)
            .distinct()
            .order_by("email")
        )


# =========================
# SEARCH USERS (for task assignee search within a workspace)
# GET /api/users/search/?q=<email>&workspace=<id>
#
# NOTE: To invite NEW users to a workspace use:
#       GET /api/search-user/?q=<email>&workspace=<id>   (admin only)
#       This endpoint is for searching existing members to assign to tasks.
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query        = request.query_params.get("q", "").strip()
    workspace_id = request.query_params.get("workspace", "").strip()

    if not query:
        return Response([], status=status.HTTP_200_OK)

    if not workspace_id:
        return Response(
            {"error": "'workspace' param is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Caller must be a member of the workspace they're searching within
    caller_is_member = WorkspaceMember.objects.filter(
        user=request.user,
        workspace_id=workspace_id,
    ).exists()

    if not caller_is_member:
        return Response(
            {"error": "You are not a member of this workspace."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Only search within that workspace's existing members
    users = (
        User.objects.filter(
            workspacemember__workspace_id=workspace_id,
            email__icontains=query,
        )
        .distinct()
        .order_by("email")[:5]
    )

    return Response([
        {"id": u.id, "email": u.email, "username": u.username}
        for u in users
    ])