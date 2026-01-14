from django.contrib import admin
from .models import Task, TaskList, TaskAssignee, Comment, ActivityLog

admin.site.register(Task)
admin.site.register(TaskList)
admin.site.register(TaskAssignee)
admin.site.register(Comment)
admin.site.register(ActivityLog)
