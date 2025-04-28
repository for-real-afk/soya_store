from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProductViewSet, OrderViewSet, NotificationViewSet, login_view, register_view

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'notifications', NotificationViewSet)

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('users/me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('users/<int:pk>/orders/', UserViewSet.as_view({'get': 'orders'}), name='user-orders'),
    path('products/featured/', ProductViewSet.as_view({'get': 'featured'}), name='featured-products'),
    path('products/bestsellers/', ProductViewSet.as_view({'get': 'bestsellers'}), name='bestseller-products'),
    path('products/category/', ProductViewSet.as_view({'get': 'by_category'}), name='products-by-category'),
    path('products/search/', ProductViewSet.as_view({'get': 'search'}), name='search-products'),
    path('orders/my/', OrderViewSet.as_view({'get': 'my_orders'}), name='my-orders'),
    path('orders/<int:pk>/status/', OrderViewSet.as_view({'patch': 'update_status'}), name='update-order-status'),
    path('notifications/mark-read/', NotificationViewSet.as_view({'post': 'mark_read'}), name='mark-notifications-read'),
    path('notifications/unread-count/', NotificationViewSet.as_view({'get': 'unread_count'}), name='unread-notifications-count'),
]