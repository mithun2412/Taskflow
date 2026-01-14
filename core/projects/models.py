from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Workspace(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="owner_id"
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "workspace"
        managed = False

    def __str__(self):
        return self.name


class WorkspaceMember(models.Model):
    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("MEMBER", "Member"),
    ]

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id"
    )

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        db_column="workspace_id"
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "workspace_member"
        managed = False
        unique_together = ("user", "workspace")

    def __str__(self):
        return f"{self.user} → {self.workspace} ({self.role})"


class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        db_column="workspace_id"
    )

    created_by = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        db_column="created_by_id"
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "project"
        managed = False

    def __str__(self):
        return self.name


class Board(models.Model):
    id = models.AutoField(primary_key=True)

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        db_column="project_id"
    )

    name = models.CharField(max_length=255)

    class Meta:
        db_table = "board"
        managed = False

    def __str__(self):
        return self.name
