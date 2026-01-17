from django.contrib import admin
from .models import (
    Sprint,
    TaskList,
    Task,
    TaskAssignee,
    Comment,
    ActivityLog,
)

admin.site.register(Sprint)
admin.site.register(TaskList)
admin.site.register(Task)
admin.site.register(TaskAssignee)
admin.site.register(Comment)
admin.site.register(ActivityLog)
