from django.db import models
import json
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.CharField(max_length=255)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    reviews = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_on_sale = models.BooleanField(default=False)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('payment_received', 'Payment Received'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    items_json = models.JSONField()
    shipping_address_json = models.JSONField()
    payment_method = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def items(self):
        if isinstance(self.items_json, dict):
            return self.items_json
        return json.loads(self.items_json)
    
    @items.setter
    def items(self, value):
        self.items_json = json.dumps(value) if not isinstance(value, str) else value
    
    @property
    def shipping_address(self):
        if isinstance(self.shipping_address_json, dict):
            return self.shipping_address_json
        return json.loads(self.shipping_address_json)
    
    @shipping_address.setter
    def shipping_address(self, value):
        self.shipping_address_json = json.dumps(value) if not isinstance(value, str) else value

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"