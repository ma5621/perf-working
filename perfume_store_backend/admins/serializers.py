from rest_framework import serializers
from .models import Admin

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['id', 'name'] # Do not expose passwordHash

class AdminLoginSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
