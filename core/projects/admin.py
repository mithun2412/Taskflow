from django.contrib import admin
from .models import Workspace, WorkspaceMember, Project, Board

admin.site.register(Workspace)
admin.site.register(WorkspaceMember)
admin.site.register(Project)
admin.site.register(Board)
