from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class AdminManager(BaseUserManager):
    def create_user(self, name, password=None, **extra_fields):
        if not name:
            raise ValueError('The Name field must be set')
        user = self.model(name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(name, password, **extra_fields)

class Admin(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255, unique=True, default='Top Notes Admin')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AdminManager()

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'admin'

class Settings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

    class Meta:
        db_table = 'settings'
        indexes = [
            models.Index(fields=['key']),
        ]
