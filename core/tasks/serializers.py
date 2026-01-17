from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Sprint,
    TaskList,
    Task,
    TaskAssignee,
    Comment,
    ActivityLog,
)

User = get_user_model()


# ---------------------------
# Sprint
# ---------------------------
class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = [
            "id",
            "name",
            "board",
            "start_date",
            "end_date",
            "is_active",
        ]


# ---------------------------
# Task List (Kanban Column)
# ---------------------------
class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = [
            "id",
            "board",
            "title",
            "position",
        ]


# ---------------------------
# Task (READ)
# ---------------------------
class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.SerializerMethodField()
    sprint_name = serializers.CharField(source="sprint.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "work_type",
            "priority",
            "status",
            "task_list",
            "position",
            "parent",
            "sprint",
            "sprint_name",
            "start_date",
            "due_date",
            "story_points",
            "created_by",
            "created_at",
            "assignees",
        ]
        read_only_fields = ["created_by", "created_at"]

    def get_assignees(self, obj):
        return [
            {
                "id": ta.user.id,
                "username": ta.user.username,
                "email": ta.user.email,
            }
            for ta in obj.task_assignees.select_related("user")
        ]


# ---------------------------
# Task (CREATE)
# ---------------------------
class TaskCreateSerializer(serializers.ModelSerializer):
    assignees = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Task
        fields = [
            "title",          # ✅ REQUIRED
            "description",
            "work_type",
            "priority",
            "status",
            "parent",
            "sprint",
            "start_date",
            "due_date",
            "story_points",
            "assignees",
        ]

    def create(self, validated_data):
        assignees = validated_data.pop("assignees", [])

        task = Task.objects.create(**validated_data)

        for user_id in assignees:
            TaskAssignee.objects.create(
                task=task,
                user_id=user_id
            )

        return task


# ---------------------------
# Task Assignee
# ---------------------------
class TaskAssigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignee
        fields = [
            "id",
            "task",
            "user",
        ]


# ---------------------------
# Comment
# ---------------------------
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "user",
            "message",
            "created_at",
        ]
        read_only_fields = ["user", "created_at"]


# ---------------------------
# Activity Log
# ---------------------------
class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "action",
            "entity_type",
            "entity_id",
            "created_at",
        ]
