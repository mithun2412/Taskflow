from django.db import models
from django.conf import settings
from django.utils import timezone
from projects.models import Board

User = settings.AUTH_USER_MODEL


# -------------------------
# TASK LIST (KANBAN COLUMN)
# -------------------------
class TaskList(models.Model):
    id = models.AutoField(primary_key=True)

    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        db_column="board_id"
    )

    title = models.CharField(max_length=100)
    position = models.IntegerField()

    class Meta:
        db_table = "task_list"
        managed = False
        ordering = ["position"]

    def __str__(self):
        return self.title


# -------------------------
# TASK (CARD)
# -------------------------
class Task(models.Model):
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
    description = models.TextField(null=True, blank=True)

    task_list = models.ForeignKey(
        TaskList,
        on_delete=models.CASCADE,
        db_column="task_list_id"
    )
    position = models.IntegerField(default=0)
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="TODO"
    )

    due_date = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        db_column="created_by_id"
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "task"
        managed = False
        ordering = ["position"]

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
        db_column="task_id"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id"
    )

    class Meta:
        db_table = "task_assignee"
        managed = False
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
        db_column="task_id"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id"
    )

    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "comment"
        managed = False

    def __str__(self):
        return f"{self.user} on {self.task}"


# -------------------------
# ACTIVITY LOG
# -------------------------
class ActivityLog(models.Model):
    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id"
    )

    action = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField()

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "activity_log"
        managed = False

    def __str__(self):
        return f"{self.user} {self.action} {self.entity_type}({self.entity_id})"
