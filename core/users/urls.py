from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import register, current_user, WorkspaceUserViewSet

router = DefaultRouter()
router.register("users", WorkspaceUserViewSet, basename="workspace-users")

urlpatterns = [
    # Auth
    path("auth/register/", register),
    path("me/", current_user, name="current-user"),

    # Users (for assignee dropdown)
    path("", include(router.urls)),
]
