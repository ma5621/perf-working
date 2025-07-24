import uuid
from django.db import models

class Perfume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nameEn = models.CharField(max_length=255)
    nameAr = models.CharField(max_length=255)
    brandEn = models.CharField(max_length=255)
    brandAr = models.CharField(max_length=255)
    categoryEn = models.CharField(max_length=255)
    categoryAr = models.CharField(max_length=255)
    genderEn = models.CharField(max_length=255)
    genderAr = models.CharField(max_length=255)
    descriptionEn = models.TextField()
    descriptionAr = models.TextField()
    sizes = models.JSONField() # Stores array of {"size": "50ml", "priceEGP": 100.0}
    stockStatus = models.CharField(max_length=50)
    imageUrl = models.URLField(max_length=500, blank=True, null=True)
    isNew = models.BooleanField(default=False)
    isBestseller = models.BooleanField(default=False)
    isActive = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nameEn

    class Meta:
        db_table = "perfumes"
        indexes = [
            models.Index(fields=['brandEn']),
            models.Index(fields=['categoryEn']),
            models.Index(fields=['genderEn']),
            models.Index(fields=['isActive']),
            models.Index(fields=['stockStatus']),
        ]
