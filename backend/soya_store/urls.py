from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProductViewSet, OrderViewSet, NotificationViewSet, login_view, register_view
from .password_reset import PasswordResetRequestView, PasswordResetConfirmView

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'notifications', NotificationViewSet)

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # User endpoints
    path('users/me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('users/<int:pk>/orders/', UserViewSet.as_view({'get': 'orders'}), name='user-orders'),
    
    # Product endpoints
    path('products/featured/', ProductViewSet.as_view({'get': 'featured'}), name='featured-products'),
    path('products/bestsellers/', ProductViewSet.as_view({'get': 'bestsellers'}), name='bestseller-products'),
    path('products/category/', ProductViewSet.as_view({'get': 'by_category'}), name='products-by-category'),
    path('products/search/', ProductViewSet.as_view({'get': 'search'}), name='search-products'),
    
    # Order endpoints
    path('orders/my/', OrderViewSet.as_view({'get': 'my_orders'}), name='my-orders'),
    path('orders/<int:pk>/status/', OrderViewSet.as_view({'patch': 'update_status'}), name='update-order-status'),
    
    # Notification endpoints
    path('notifications/mark-read/', NotificationViewSet.as_view({'post': 'mark_read'}), name='mark-notifications-read'),
    path('notifications/unread-count/', NotificationViewSet.as_view({'get': 'unread_count'}), name='unread-notifications-count'),
]