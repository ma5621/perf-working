from rest_framework import serializers

class PerfumeSizeSerializer(serializers.Serializer):
    size = serializers.CharField(max_length=50)
    priceEGP = serializers.FloatField()

class PublicPerfumeSerializer(serializers.Serializer):
    """Serializer for public consumption, excludes internal fields like isActive."""
    id = serializers.UUIDField(read_only=True)
    nameEn = serializers.CharField(max_length=255)
    nameAr = serializers.CharField(max_length=255)
    brandEn = serializers.CharField(max_length=255)
    brandAr = serializers.CharField(max_length=255)
    categoryEn = serializers.CharField(max_length=255)
    categoryAr = serializers.CharField(max_length=255)
    genderEn = serializers.CharField(max_length=255)
    genderAr = serializers.CharField(max_length=255)
    descriptionEn = serializers.CharField()
    descriptionAr = serializers.CharField()
    sizes = serializers.ListField(child=PerfumeSizeSerializer())
    stockStatus = serializers.CharField(max_length=50)
    imageUrl = serializers.URLField(max_length=500, allow_blank=True, allow_null=True)
    isNew = serializers.BooleanField(default=False)
    isBestseller = serializers.BooleanField(default=False)

class AdminPerfumeSerializer(serializers.Serializer):
    """Serializer for admin use, includes all fields."""
    id = serializers.UUIDField(read_only=True)
    nameEn = serializers.CharField(max_length=255)
    nameAr = serializers.CharField(max_length=255)
    brandEn = serializers.CharField(max_length=255)
    brandAr = serializers.CharField(max_length=255)
    categoryEn = serializers.CharField(max_length=255)
    categoryAr = serializers.CharField(max_length=255)
    genderEn = serializers.CharField(max_length=255)
    genderAr = serializers.CharField(max_length=255)
    descriptionEn = serializers.CharField()
    descriptionAr = serializers.CharField()
    sizes = serializers.ListField(child=PerfumeSizeSerializer())
    stockStatus = serializers.CharField(max_length=50)
    imageUrl = serializers.URLField(max_length=500, allow_blank=True, allow_null=True)
    isNew = serializers.BooleanField(default=False)
    isBestseller = serializers.BooleanField(default=False)
    isActive = serializers.BooleanField(default=True)
