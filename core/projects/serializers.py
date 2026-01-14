from rest_framework import serializers
from .models import Workspace, Project, Board


class WorkspaceSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ["id", "name", "owner", "created_at", "is_admin"]
        read_only_fields = ["owner", "created_at"]

    def get_is_admin(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        # 🔥 SINGLE SOURCE OF TRUTH
        return request.user.is_superuser


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "workspace", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ["id", "name", "project"]
