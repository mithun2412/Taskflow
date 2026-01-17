from rest_framework import serializers
from .models import Workspace, Project, Board, WorkspaceMember


class WorkspaceSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ["id", "name", "owner", "created_at", "is_admin"]
        read_only_fields = ["owner", "created_at"]

    def get_is_admin(self, obj):
        request = self.context.get("request")
        return request.user.is_superuser if request else False


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "workspace", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ["id", "name", "project"]


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ["id", "email", "username"]
