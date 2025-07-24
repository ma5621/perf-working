from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfumeListView, PerfumeDetailView, BrandListView, CategoryListView, PerfumeAdminViewSet

router = DefaultRouter()
router.register(r'admin/perfumes', PerfumeAdminViewSet, basename='admin-perfume')

urlpatterns = [
    path('perfumes/', PerfumeListView.as_view(), name='perfume-list'),
    path('perfumes/<str:product_id>/', PerfumeDetailView.as_view(), name='perfume-detail'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', include(router.urls)), # Include router URLs
]
