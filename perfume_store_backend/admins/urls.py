from django.urls import path
from .views import AdminLoginView, SettingsView, AdminPasswordUpdateView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/settings/', SettingsView.as_view(), name='admin-settings'),
    path('admin/update-password/', AdminPasswordUpdateView.as_view(), name='admin-update-password'),
]
