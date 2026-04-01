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
        if not request:
            return False
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
            role="ADMIN",
        ).exists() or request.user.is_superuser


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
    email    = serializers.EmailField(source="user.email",    read_only=True)
    username = serializers.CharField(source="user.username",  read_only=True)
    user_id  = serializers.IntegerField(source="user.id",     read_only=True)

    class Meta:
        model  = WorkspaceMember
        fields = ["id", "user_id", "email", "username", "role", "joined_at"]
        read_only_fields = ["id", "user_id", "email", "username", "joined_at"]