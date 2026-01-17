from django.db import models
from django.conf import settings
from django.utils import timezone

from projects.models import Board

User = settings.AUTH_USER_MODEL

class Sprint(models.Model):
    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=100)

    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name="sprints"
    )

    start_date = models.DateField()
    end_date = models.DateField()

    is_active = models.BooleanField(default=False)

    class Meta:
        db_table = "sprint"
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class TaskList(models.Model):
    id = models.AutoField(primary_key=True)

    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name="task_lists"
    )

    title = models.CharField(max_length=100)
    position = models.IntegerField()

    class Meta:
        db_table = "task_list"
        ordering = ["position"]

    def __str__(self):
        return self.title



class Task(models.Model):
    WORK_TYPE_CHOICES = [
        ("TASK", "Task"),
        ("STORY", "Story"),
        ("BUG", "Bug"),
        ("EPIC", "Epic"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    ]

    STATUS_CHOICES = [
        ("TODO", "To Do"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done"),
    ]

    id = models.AutoField(primary_key=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    work_type = models.CharField(
        max_length=20,
        choices=WORK_TYPE_CHOICES,
        default="TASK"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="TODO"
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="MEDIUM"
    )

    task_list = models.ForeignKey(
        "TaskList",
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    position = models.IntegerField(default=0)

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="subtasks"
    )

    sprint = models.ForeignKey(
        "Sprint",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasks"
    )

    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    story_points = models.PositiveIntegerField(null=True, blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="reported_tasks"
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "task"
        ordering = ["position", "id"]
        managed = True

    def __str__(self):
        return self.title


# -------------------------
# TASK ASSIGNEE
# -------------------------
class TaskAssignee(models.Model):
    id = models.AutoField(primary_key=True)

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="task_assignees"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = "task_assignee"
        unique_together = ("task", "user")

    def __str__(self):
        return f"{self.user} → {self.task}"


# -------------------------
# COMMENT
# -------------------------
class Comment(models.Model):
    id = models.AutoField(primary_key=True)

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "comment"

    def __str__(self):
        return f"{self.user} on {self.task}"


# -------------------------
# ACTIVITY LOG
# -------------------------
class ActivityLog(models.Model):
    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    action = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField()

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "activity_log"

    def __str__(self):
        return f"{self.user} {self.action} {self.entity_type}({self.entity_id})"
