from django.urls import path
from .views import current_user, register

urlpatterns = [
    path("auth/register/", register),
    path("me/", current_user, name="current-user"),
]
