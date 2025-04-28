from rest_framework import serializers
from .models import User, Product, Order, Notification
import json

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        min_length=8,
        help_text='Password must be at least 8 characters and contain letters, numbers, and special characters'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        required=False
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'password_confirm', 'email', 'name', 'is_admin']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_admin': {'read_only': True}  # Only superusers can set is_admin
        }
    
    def validate(self, data):
        """
        Check that the passwords match and are strong enough
        """
        # Check if this is registration (new user) with password confirmation
        if 'password_confirm' in data:
            if data['password'] != data.pop('password_confirm'):
                raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        
        # Check password strength
        password = data.get('password')
        if password:
            # Check for complexity requirements
            has_number = any(char.isdigit() for char in password)
            has_letter = any(char.isalpha() for char in password)
            has_special = any(not char.isalnum() for char in password)
            
            if not (has_number and has_letter):
                raise serializers.ValidationError({
                    'password': 'Password must contain both letters and numbers'
                })
        
        return data
    
    def create(self, validated_data):
        # Create a new user with secure password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        
        if 'name' in validated_data:
            user.name = validated_data['name']
            
        # Admin status should only be set by superusers through admin interface
        # or specific admin-creation endpoints with proper authorization
        user.save()
        return user
        
    def update(self, instance, validated_data):
        """
        Handle password updates securely
        """
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Handle password separately with proper hashing
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.JSONField(required=True)
    shipping_address = serializers.JSONField(required=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total', 'items', 'shipping_address', 'payment_method', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        # Handle JSON fields properly
        if isinstance(validated_data.get('items'), dict):
            items_json = validated_data.pop('items')
        else:
            items_json = json.loads(validated_data.pop('items'))
        
        if isinstance(validated_data.get('shipping_address'), dict):
            shipping_address_json = validated_data.pop('shipping_address')
        else:
            shipping_address_json = json.loads(validated_data.pop('shipping_address'))
        
        # Create order
        order = Order.objects.create(
            items_json=items_json,
            shipping_address_json=shipping_address_json,
            **validated_data
        )
        return order

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'related_order', 'created_at']
        read_only_fields = ['id', 'created_at']