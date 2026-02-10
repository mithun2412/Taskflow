from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from projects.views import (
    WorkspaceViewSet,
    ProjectViewSet,
    BoardViewSet,
    WorkspaceMemberViewSet,
    add_workspace_member,   # ✅ FUNCTION VIEW (IMPORTANT)
)

from tasks.views import (
    TaskListViewSet,
    TaskViewSet,
    TaskAssigneeViewSet,
    CommentViewSet,
    ActivityLogViewSet,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()

# ======================
# PROJECTS / WORKSPACES
# ======================
router.register("workspaces", WorkspaceViewSet, basename="workspace")
router.register("projects", ProjectViewSet, basename="project")
router.register("boards", BoardViewSet, basename="board")

router.register(
    "workspace-members",
    WorkspaceMemberViewSet,
    basename="workspace-member"
)

# ======================
# TASKS
# ======================
router.register("task-lists", TaskListViewSet, basename="task-list")
router.register("tasks", TaskViewSet, basename="task")
router.register("task-assignees", TaskAssigneeViewSet, basename="task-assignee")
router.register("comments", CommentViewSet, basename="comment")
router.register("activity", ActivityLogViewSet, basename="activity")

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔥 ROUTER URLS
    path("api/", include(router.urls)),

    # 🔥 ADD WORKSPACE MEMBER (NON-ROUTER ENDPOINT)
    path(
        "api/add-workspace-member/",
        add_workspace_member,
        name="add-workspace-member"
    ),

    # USERS (search, assignees, current user)
    path("api/", include(("users.urls", "users"), namespace="users")),

    # AUTH
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
