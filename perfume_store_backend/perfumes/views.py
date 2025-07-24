import json
import os
import logging
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PublicPerfumeSerializer, AdminPerfumeSerializer
from .models import Perfume
from uuid import UUID

# Define the path to the JSON file relative to the project root
PERFUMES_FILE_PATH = 'perfume_store_backend/data/perfumes.json'

def _read_perfumes_from_file():
    # Corrected path: go up one level from 'perfumes' to 'perfume_store_backend', then into 'data'
    full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'perfumes.json')
    if not os.path.exists(full_path):
        return []
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        try:
            perfumes = json.loads(content)
            return perfumes
        except json.JSONDecodeError as e:
            return []

def _write_perfumes_to_file(perfumes):
    # Corrected path: go up one level from 'perfumes' to 'perfume_store_backend', then into 'data'
    full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'perfumes.json')
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(perfumes, f, indent=4, ensure_ascii=False)
    except Exception as e:
        # It's a good idea to log this error too!
        logging.error(f"Failed to write perfumes to file {full_path}: {e}")

class PerfumeListView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # --- This is the original logic ---
            language = request.query_params.get('language')
            brand_filter = request.query_params.get('brandFilter')
            category_filter = request.query_params.get('categoryFilter')
            gender_filter = request.query_params.get('genderFilter')
            stock_status_filter = request.query_params.get('stockStatusFilter')
            search_term = request.query_params.get('searchTerm')
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 12))
            offset = (page - 1) * limit

            queryset = Perfume.objects.filter(isActive=True)
            if search_term:
                if language == "ar":
                    queryset = queryset.filter(nameAr__icontains=search_term)
                else:
                    queryset = queryset.filter(nameEn__icontains=search_term)
            if brand_filter:
                if language == "ar":
                    queryset = queryset.filter(brandAr=brand_filter)
                else:
                    queryset = queryset.filter(brandEn=brand_filter)
            if category_filter:
                if language == "ar":
                    queryset = queryset.filter(categoryAr=category_filter)
                else:
                    queryset = queryset.filter(categoryEn=category_filter)
            if gender_filter:
                if language == "ar":
                    queryset = queryset.filter(genderAr=gender_filter)
                else:
                    queryset = queryset.filter(genderEn=gender_filter)
            if stock_status_filter:
                if stock_status_filter == 'out_of_stock':
                    queryset = queryset.filter(stockStatus__iexact='Out of Stock')
                elif stock_status_filter == 'in_stock':
                    queryset = queryset.filter(stockStatus__iexact='In Stock')
                elif stock_status_filter == 'low_stock':
                    queryset = queryset.filter(stockStatus__iexact='Low Stock')
                else:
                    queryset = queryset.filter(stockStatus__iexact=stock_status_filter)
            queryset = queryset.order_by('-created_at')

            total_items = queryset.count()
            total_pages = (total_items + limit - 1) // limit
            paginated_perfumes = queryset[offset:offset + limit]

            serializer = PublicPerfumeSerializer(paginated_perfumes, many=True)
            return Response({
                "perfumes": serializer.data,
                "pagination": {
                    "currentPage": page,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "hasNext": page < total_pages,
                    "hasPrev": page > 1
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # --- This is the new, robust error handling ---
            # For YOU: This logs the detailed error to your server console/log file.
            logging.error(f"Error in PerfumeListView: {e}", exc_info=True)
            
            # For THE USER: This returns a safe, generic error message to the browser.
            return Response(
                {"detail": "An error occurred while fetching perfumes. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PerfumeDetailView(APIView):
    def get(self, request, product_id, *args, **kwargs):
        # Defensive: check if product_id is a valid UUID
        try:
            UUID(str(product_id))
        except Exception:
            return Response({'detail': 'Invalid product ID.'}, status=400)
        try:
            perfume = Perfume.objects.get(id=product_id, isActive=True)
        except Perfume.DoesNotExist:
            return Response(None, status=status.HTTP_200_OK)
        serializer = PublicPerfumeSerializer(perfume)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BrandListView(APIView):
    def get(self, request, *args, **kwargs):
        language = request.query_params.get('language')
        queryset = Perfume.objects.filter(isActive=True)
        if language == "ar":
            brands = queryset.values_list('brandAr', flat=True)
        else:
            brands = queryset.values_list('brandEn', flat=True)
        unique_brands = sorted(list(set(filter(None, brands))))
        return Response(unique_brands, status=status.HTTP_200_OK)

class CategoryListView(APIView):
    def get(self, request, *args, **kwargs):
        language = request.query_params.get('language')
        queryset = Perfume.objects.filter(isActive=True)
        if language == "ar":
            categories = queryset.values_list('categoryAr', flat=True)
        else:
            categories = queryset.values_list('categoryEn', flat=True)
        unique_categories = sorted(list(set(filter(None, categories))))
        return Response(unique_categories, status=status.HTTP_200_OK)

from rest_framework import viewsets
from django.core.management import call_command # Import call_command
from perfume_store_backend.admins.views import IsAdminUser # Import the permission

class PerfumeAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser] # Protect this viewset
    serializer_class = AdminPerfumeSerializer

    def list(self, request, *args, **kwargs):
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        offset = (page - 1) * limit

        queryset = Perfume.objects.all().order_by('-created_at')
        total_items = queryset.count()
        total_pages = (total_items + limit - 1) // limit
        paginated_perfumes = queryset[offset:offset + limit]

        serializer = self.serializer_class(paginated_perfumes, many=True)
        return Response({
            "perfumes": serializer.data,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_items,
                "hasNext": page < total_pages,
                "hasPrev": page > 1
            }
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        perfume = Perfume.objects.create(**serializer.validated_data)
        return Response(self.serializer_class(perfume).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            perfume = Perfume.objects.get(id=pk)
        except Perfume.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(perfume)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None, *args, **kwargs):
        try:
            perfume = Perfume.objects.get(id=pk)
        except Perfume.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(perfume, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        for attr, value in serializer.validated_data.items():
            setattr(perfume, attr, value)
        perfume.save()
        return Response(self.serializer_class(perfume).data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None, *args, **kwargs):
        try:
            perfume = Perfume.objects.get(id=pk)
        except Perfume.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(perfume, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for attr, value in serializer.validated_data.items():
            setattr(perfume, attr, value)
        perfume.save()
        return Response(self.serializer_class(perfume).data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            perfume = Perfume.objects.get(id=pk)
        except Perfume.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        perfume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
