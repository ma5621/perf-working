from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import uuid

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import Perfume
from .serializers import PublicPerfumeSerializer, AdminPerfumeSerializer

Admin = get_user_model()

class PerfumeModelTest(TestCase):
    """
    Test suite for the Perfume model.
    """

    def setUp(self):
        """
        Set up a new perfume instance for testing.
        """
        self.perfume = Perfume.objects.create(
            nameEn="Test Perfume",
            nameAr="عطر اختباري",
            brandEn="Test Brand",
            brandAr="ماركة اختبارية",
            categoryEn="Test Category",
            categoryAr="فئة اختبارية",
            genderEn="Unisex",
            genderAr="للجنسين",
            descriptionEn="A test description.",
            descriptionAr="وصف اختباري.",
            sizes=[{"size": "100ml", "priceEGP": 500}],
            stockStatus="In Stock",
            isNew=True,
            isBestseller=False,
            isActive=True
        )

    def test_perfume_creation(self):
        """
        Test that a Perfume instance can be created with the correct attributes.
        """
        self.assertIsInstance(self.perfume, Perfume)
        self.assertEqual(self.perfume.nameEn, "Test Perfume")
        self.assertEqual(self.perfume.stockStatus, "In Stock")
        self.assertTrue(self.perfume.isActive)

    def test_perfume_str_representation(self):
        """
        Test the string representation of the Perfume model.
        """
        self.assertEqual(str(self.perfume), "Test Perfume")

class PerfumeAPITest(APITestCase):
    """
    Test suite for the Perfume API endpoints.
    """

    def setUp(self):
        """
        Set up initial data for API tests.
        """
        self.perfume1 = Perfume.objects.create(
            nameEn="Perfume A", nameAr="عطر أ", brandEn="Brand X", brandAr="ماركة س",
            categoryEn="Floral", categoryAr="زهري", genderEn="Female", genderAr="أنثى",
            descriptionEn="Desc A", descriptionAr="وصف أ", sizes=[{"size": "50ml", "priceEGP": 200}],
            stockStatus="In Stock", isActive=True
        )
        self.perfume2 = Perfume.objects.create(
            nameEn="Perfume B", nameAr="عطر ب", brandEn="Brand Y", brandAr="ماركة ص",
            categoryEn="Woody", categoryAr="خشبي", genderEn="Male", genderAr="ذكر",
            descriptionEn="Desc B", descriptionAr="وصف ب", sizes=[{"size": "100ml", "priceEGP": 300}],
            stockStatus="Out of Stock", isActive=True
        )
        self.inactive_perfume = Perfume.objects.create(
            nameEn="Perfume C", nameAr="عطر ج", brandEn="Brand Z", brandAr="ماركة ع",
            categoryEn="Citrus", categoryAr="حمضي", genderEn="Unisex", genderAr="للجنسين",
            descriptionEn="Desc C", descriptionAr="وصف ج", sizes=[{"size": "75ml", "priceEGP": 250}],
            stockStatus="In Stock", isActive=False
        )

    def test_list_perfumes(self):
        """
        Test retrieving a list of active perfumes.
        """
        url = reverse('perfume-list')
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['perfumes']), 2) # Only active perfumes

    def test_list_perfumes_with_filter(self):
        """
        Test filtering the list of perfumes by brand.
        """
        url = reverse('perfume-list')
        response = self.client.get(url, {'brandFilter': 'Brand X'}, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['perfumes']), 1)
        self.assertEqual(response.data['perfumes'][0]['nameEn'], 'Perfume A')

    def test_get_perfume_detail(self):
        """
        Test retrieving a single perfume's details.
        """
        url = reverse('perfume-detail', kwargs={'product_id': self.perfume1.id})
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nameEn'], self.perfume1.nameEn)

    def test_get_perfume_detail_not_found(self):
        """
        Test retrieving a non-existent perfume.
        """
        invalid_uuid = uuid.uuid4()
        url = reverse('perfume-detail', kwargs={'product_id': invalid_uuid})
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK) # Returns 200 with null body
        self.assertIsNone(response.data)

    def test_get_inactive_perfume_detail(self):
        """
        Test that inactive perfumes are not returned by the public detail view.
        """
        url = reverse('perfume-detail', kwargs={'product_id': self.inactive_perfume.id})
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data)

    def test_get_brands(self):
        """
        Test retrieving a list of unique brand names.
        """
        url = reverse('brand-list')
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('Brand X', response.data)
        self.assertIn('Brand Y', response.data)

    def test_get_categories(self):
        """
        Test retrieving a list of unique category names.
        """
        url = reverse('category-list')
        response = self.client.get(url, format='json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('Floral', response.data)
        self.assertIn('Woody', response.data)

class PerfumeAdminAPITest(APITestCase):
    """
    Test suite for the admin-only Perfume API endpoints.
    """

    def setUp(self):
        """
        Set up an admin user and initial data for admin API tests.
        """
        self.admin_user = Admin.objects.create_superuser(
            name='testadmin',
            password='testpassword'
        )
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.perfume = Perfume.objects.create(
            nameEn="Admin Perfume", nameAr="عطر إداري", brandEn="Admin Brand",
            brandAr="ماركة إدارية", categoryEn="Admin Category", categoryAr="فئة إدارية",
            genderEn="Unisex", genderAr="للجنسين", descriptionEn="Admin Desc",
            descriptionAr="وصف إداري", sizes=[{"size": "100ml", "priceEGP": 1000}],
            stockStatus="In Stock", isActive=True, imageUrl="http://example.com/image.jpg"
        )

    def test_admin_list_perfumes(self):
        """
        Test that an admin can list all perfumes, including inactive ones.
        """
        Perfume.objects.create(nameEn="Inactive Perfume", isActive=False, stockStatus="In Stock", sizes=[], descriptionEn="", descriptionAr="", genderEn="", genderAr="", categoryEn="", categoryAr="", brandEn="", brandAr="", nameAr="", imageUrl="http://example.com/inactive.jpg")
        url = reverse('admin-perfume-list')
        response = self.client.get(url, format='json', secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['totalItems'], 2)

    def test_admin_create_perfume(self):
        """
        Test that an admin can create a new perfume.
        """
        url = reverse('admin-perfume-list')
        data = {
            "nameEn": "New Perfume", "nameAr": "عطر جديد", "brandEn": "New Brand",
            "brandAr": "ماركة جديدة", "categoryEn": "New Category", "categoryAr": "فئة جديدة",
            "genderEn": "Unisex", "genderAr": "للجنسين", "descriptionEn": "New Desc",
            "descriptionAr": "وصف جديد", "sizes": [{"size": "100ml", "priceEGP": 1200}],
            "stockStatus": "In Stock", "isActive": True, "isNew": True, "isBestseller": False,
            "imageUrl": "http://example.com/new_perfume.jpg"  # <-- THE FIX IS HERE
        }
        response = self.client.post(url, data, format='json', secure=True)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Perfume.objects.count(), 2)
        self.assertEqual(response.data['nameEn'], 'New Perfume')

    def test_admin_update_perfume(self):
        """
        Test that an admin can update an existing perfume.
        """
        url = reverse('admin-perfume-detail', kwargs={'pk': self.perfume.pk})
        data = {"nameEn": "Updated Perfume Name"}
        response = self.client.patch(url, data, format='json', secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.perfume.refresh_from_db()
        self.assertEqual(self.perfume.nameEn, "Updated Perfume Name")

    def test_admin_delete_perfume(self):
        """
        Test that an admin can delete a perfume.
        """
        url = reverse('admin-perfume-detail', kwargs={'pk': self.perfume.pk})
        response = self.client.delete(url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Perfume.objects.count(), 0)

    def test_unauthorized_access(self):
        """
        Test that a non-admin user cannot access the admin endpoints.
        """
        self.client.credentials() # Remove authentication
        url = reverse('admin-perfume-list')
        response = self.client.get(url, format='json', secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)