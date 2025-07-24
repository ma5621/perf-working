from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.cache import cache
from .models import Admin, Settings

# Custom Permission for Admin Users
class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny] # Allow anyone to attempt to log in

    def post(self, request, *args, **kwargs):
        name = request.data.get('name', 'Top Notes Admin') # Default to the single admin name
        password = request.data.get('password')

        if not password:
            return Response({"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limiting
        client_ip = self.get_client_ip(request)
        cache_key = f"admin_login_attempts_{client_ip}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:
            return Response({"detail": "Too many login attempts. Please try again in 15 minutes."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        try:
            user = Admin.objects.get(name=name)
            if not user.check_password(password):
                raise Admin.DoesNotExist
        except Admin.DoesNotExist:
            user = None

        if user is not None:
            cache.delete(cache_key)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,
                "admin": {
                    "name": user.name
                }
            }, status=status.HTTP_200_OK)
        else:
            cache.set(cache_key, attempts + 1, 900) # 15 minutes
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class SettingsView(APIView):
    permission_classes = [IsAdminUser] # Protect this view

    def get(self, request, *args, **kwargs):
        settings = Settings.objects.all()
        settings_data = {setting.key: setting.value for setting in settings}
        return Response(settings_data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        key = request.data.get('key')
        value = request.data.get('value')
        
        if not key or value is None:
            return Response({"detail": "Key and value are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        setting, created = Settings.objects.get_or_create(
            key=key,
            defaults={'value': value, 'description': f'Setting for {key}'}
        )
        
        if not created:
            setting.value = value
            setting.save()
        
        return Response({"message": "Setting updated successfully"}, status=status.HTTP_200_OK)

class AdminPasswordUpdateView(APIView):
    permission_classes = [IsAdminUser] # Protect this view

    def post(self, request, *args, **kwargs):
        password = request.data.get('password')
        
        if not password or len(password) < 6:
            return Response({"detail": "Password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.set_password(password)
        user.save()
        
        # Optional: Delete all old tokens to force re-login on other devices
        Token.objects.filter(user=user).delete()
        
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
