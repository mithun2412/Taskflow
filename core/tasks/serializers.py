from rest_framework import serializers
from .models import (
    TaskList,
    Task,
    TaskAssignee,
    Comment,
    ActivityLog,
)


class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = ['id', 'board', 'title', 'position']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'task_list',
            'priority',
            'status',
            'due_date',
            'position',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']


class TaskAssigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignee
        fields = ['id', 'task', 'user']


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'message', 'created_at']
        read_only_fields = ['user', 'created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'action',
            'entity_type',
            'entity_id',
            'created_at',
        ]
