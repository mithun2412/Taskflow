from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    register,
    current_user,
    WorkspaceUserViewSet,
    search_users,
)

router = DefaultRouter()
router.register("users", WorkspaceUserViewSet, basename="workspace-users")

urlpatterns = [
    # 🔐 Auth
    path("auth/register/", register),
    path("me/", current_user, name="current-user"),

    # 🔍 Search users FIRST (must come before router)
    path("users/search/", search_users, name="search-users"),

    # 👥 Workspace users (assignee dropdown)
    path("", include(router.urls)),
]
