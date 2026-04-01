from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from projects.views import (
    WorkspaceViewSet,
    ProjectViewSet,
    BoardViewSet,
    WorkspaceMemberViewSet,
    search_user_for_invite,    # NEW
    add_workspace_member,
    update_member_role,        # NEW
    remove_workspace_member,   # NEW
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
router.register("workspaces",        WorkspaceViewSet,       basename="workspace")
router.register("projects",          ProjectViewSet,         basename="project")
router.register("boards",            BoardViewSet,           basename="board")
router.register("workspace-members", WorkspaceMemberViewSet, basename="workspace-member")

# ======================
# TASKS
# ======================
router.register("task-lists",     TaskListViewSet,     basename="task-list")
router.register("tasks",          TaskViewSet,         basename="task")
router.register("task-assignees", TaskAssigneeViewSet, basename="task-assignee")
router.register("comments",       CommentViewSet,      basename="comment")
router.register("activity",       ActivityLogViewSet,  basename="activity")

urlpatterns = [
    path("admin/", admin.site.urls),

    # ROUTER URLS
    path("api/", include(router.urls)),

    # ── Member management ──────────────────────────────────────────
    # Step 1: search a user by email before adding (admin only)
    path("api/search-user/",           search_user_for_invite, name="search-user-for-invite"),

    # Step 2: add them with a role  { workspace, email, role }
    path("api/add-workspace-member/",  add_workspace_member,   name="add-workspace-member"),

    # Change role later              { member_id, role }
    path("api/update-member-role/",    update_member_role,     name="update-member-role"),

    # Remove a member                { member_id }
    path("api/remove-member/",         remove_workspace_member,name="remove-workspace-member"),
    # ───────────────────────────────────────────────────────────────

    # USERS (search, assignees, current user)
    path("api/", include(("users.urls", "users"), namespace="users")),

    # AUTH
    path("api/token/",         TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(),    name="token_refresh"),
]