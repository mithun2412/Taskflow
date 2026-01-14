from .models import ActivityLog
from django.utils import timezone

def log_activity(user, action, entity_type, entity_id):
    ActivityLog.objects.create(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        created_at=timezone.now()
    )
