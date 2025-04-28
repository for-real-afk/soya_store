from rest_framework import serializers
from .models import User, Product, Order, Notification
import json

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'name', 'is_admin']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        if 'name' in validated_data:
            user.name = validated_data['name']
        if 'is_admin' in validated_data:
            user.is_admin = validated_data['is_admin']
        user.save()
        return user

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