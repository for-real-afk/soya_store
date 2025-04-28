import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from soya_store.models import User, Product, Order
import requests

class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting data seeding...'))
        
        # Create admin user if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_user(
                username='admin',
                password='admin123',
                email='admin@organicbeans.com',
                name='Admin User',
                is_admin=True,
                is_superuser=True,
                is_staff=True
            )
            self.stdout.write(self.style.SUCCESS(f'Admin user created: {admin_user.username}'))
        else:
            admin_user = User.objects.get(username='admin')
            self.stdout.write(self.style.SUCCESS(f'Admin user already exists: {admin_user.username}'))
        
        # Get products from Express API or create sample products if the API fails
        try:
            # Try to fetch from Express backend
            response = requests.get('http://localhost:5000/api/products')
            if response.status_code == 200:
                products_data = response.json()
                self.stdout.write(self.style.NOTICE(f'Found {len(products_data)} products from Express API'))
                
                for product_data in products_data:
                    # Check if product exists
                    if not Product.objects.filter(name=product_data['name']).exists():
                        # Convert Express fields to Django fields
                        product = Product(
                            id=product_data.get('id'),
                            name=product_data.get('name'),
                            description=product_data.get('description', ''),
                            price=product_data.get('price', 0.0),
                            category=product_data.get('category', 'Seeds'),
                            subcategory=product_data.get('subcategory'),
                            image_url=product_data.get('imageUrl', ''),
                            rating=product_data.get('rating'),
                            reviews=product_data.get('reviews', 0),
                            is_featured=product_data.get('isFeatured', False),
                            is_best_seller=product_data.get('isBestSeller', False),
                            is_on_sale=product_data.get('isOnSale', False),
                            original_price=product_data.get('originalPrice'),
                            stock=product_data.get('stock', 0)
                        )
                        product.save()
                        self.stdout.write(self.style.SUCCESS(f'Product created: {product.name}'))
                    else:
                        self.stdout.write(self.style.SUCCESS(f'Product already exists: {product_data["name"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Failed to fetch products from Express API: {response.status_code}'))
                self._create_sample_products()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Error fetching products from Express API: {str(e)}'))
            self._create_sample_products()
        
        # Get orders from Express API or create sample orders if the API fails
        try:
            # Try to fetch from Express backend
            response = requests.get('http://localhost:5000/api/orders')
            if response.status_code == 200:
                orders_data = response.json()
                self.stdout.write(self.style.NOTICE(f'Found {len(orders_data)} orders from Express API'))
                
                for order_data in orders_data:
                    # Check if order exists
                    if not Order.objects.filter(id=order_data['id']).exists():
                        # Get the user
                        user = User.objects.get(id=order_data['userId'])
                        
                        # Convert Express fields to Django fields
                        order = Order(
                            id=order_data.get('id'),
                            user=user,
                            status=order_data.get('status', 'pending'),
                            total=order_data.get('total', 0.0),
                            items_json=order_data.get('items', []),
                            shipping_address_json=order_data.get('shippingAddress', {}),
                            payment_method=order_data.get('paymentMethod', 'Credit Card')
                        )
                        order.save()
                        self.stdout.write(self.style.SUCCESS(f'Order created: #{order.id}'))
                    else:
                        self.stdout.write(self.style.SUCCESS(f'Order already exists: #{order_data["id"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Failed to fetch orders from Express API: {response.status_code}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Error fetching orders from Express API: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('Data seeding completed!'))

    def _create_sample_products(self):
        """Create sample products if API fetch fails"""
        self.stdout.write(self.style.NOTICE('Creating sample products...'))
        
        sample_products = [
            {
                'name': 'Organic Soybean Seeds - 2lb Bag',
                'description': 'Premium quality, non-GMO organic soybean seeds. Perfect for home gardening or small-scale farming.',
                'price': 24.99,
                'category': 'Seeds',
                'subcategory': 'Soybeans',
                'image_url': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
                'rating': 4.8,
                'reviews': 42,
                'is_featured': True,
                'is_best_seller': True,
                'stock': 120
            },
            {
                'name': 'Heirloom Black Soybean Seeds - 1lb Bag',
                'description': 'Black soybeans are known for their rich flavor and nutritional profile. These heirloom seeds are perfect for specialty crops.',
                'price': 18.99,
                'category': 'Seeds',
                'subcategory': 'Soybeans',
                'image_url': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
                'rating': 4.6,
                'reviews': 28,
                'is_featured': True,
                'stock': 75
            },
            {
                'name': 'Soybean Starter Kit',
                'description': 'Everything you need to start growing soybeans at home, including seeds, soil, pots and detailed instructions.',
                'price': 39.99,
                'category': 'Kits',
                'subcategory': 'Starter Kits',
                'image_url': 'https://images.unsplash.com/photo-1647214177117-d51a83d17d39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
                'rating': 4.9,
                'reviews': 56,
                'is_featured': True,
                'is_best_seller': True,
                'stock': 45
            }
        ]
        
        for product_data in sample_products:
            if not Product.objects.filter(name=product_data['name']).exists():
                product = Product(**product_data)
                product.save()
                self.stdout.write(self.style.SUCCESS(f'Sample product created: {product.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Sample product already exists: {product_data["name"]}'))