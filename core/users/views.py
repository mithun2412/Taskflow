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
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# CURRENT USER
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    })


# =========================
# WORKSPACE USERS (ASSIGNEES)
# GET /users/?workspace=<id>
# =========================
class WorkspaceUserViewSet(ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace")

        if not workspace_id:
            return User.objects.none()

        return User.objects.filter(
            workspacemember__workspace_id=workspace_id
        ).distinct().order_by("email")


# =========================
# SEARCH USERS (INVITE PEOPLE)
# GET /users/search/?q=email&workspace=<id>
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get("q", "").strip()
    workspace_id = request.query_params.get("workspace")

    if not query:
        return Response([])

    users = User.objects.filter(
        email__icontains=query
    ).order_by("email")

    # 🔒 OPTIONAL: exclude users already in workspace
    if workspace_id:
        users = users.exclude(
            workspacemember__workspace_id=workspace_id
        )

    users = users[:5]

    return Response([
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
        }
        for u in users
    ])
