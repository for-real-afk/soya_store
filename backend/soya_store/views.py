from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Product, Order, Notification
from .serializers import UserSerializer, ProductSerializer, OrderSerializer, NotificationSerializer

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_admin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':  # Allow anyone to register
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]  # Admin only for user management
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Return the authenticated user's details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def orders(self, request, pk=None):
        """Return a user's orders"""
        # Check if current user is admin or the user themselves
        if not (request.user.is_admin or request.user.id == int(pk)):
            return Response({"detail": "You do not have permission to view this user's orders."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        orders = Order.objects.filter(user_id=pk).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:  # Anyone can see products
            permission_classes = [permissions.AllowAny]
        else:  # Only admins can create, update, delete
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Return featured products"""
        featured_products = Product.objects.filter(is_featured=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def bestsellers(self, request):
        """Return bestseller products"""
        bestsellers = Product.objects.filter(is_best_seller=True)
        serializer = self.get_serializer(bestsellers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def by_category(self, request):
        """Return products by category"""
        category = request.query_params.get('category', None)
        if category is None:
            return Response({"detail": "Category parameter is required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        products = Product.objects.filter(category=category)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """Search products by name or description"""
        query = request.query_params.get('q', None)
        if query is None:
            return Response({"detail": "Search query parameter 'q' is required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':  # Allow authenticated users to create orders
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]  # Only admins can see all orders or modify them
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_orders(self, request):
        """Return the authenticated user's orders"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Set the user to the authenticated user on create"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """Update an order's status - admin only"""
        order = self.get_object()
        status_value = request.data.get('status')
        if not status_value:
            return Response({"detail": "Status is required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status value
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if status_value not in valid_statuses:
            return Response({"detail": f"Invalid status. Choose from: {', '.join(valid_statuses)}"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        order.status = status_value
        order.save()
        
        # Create notification for user
        message = f"Your order #{order.id} status has been updated to: {status_value}"
        Notification.objects.create(
            user=order.user,
            title="Order Status Updated",
            message=message,
            related_order=order
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the authenticated user's notifications by default"""
        user = self.request.user
        if user.is_admin and self.action == 'list' and self.request.query_params.get('all') == 'true':
            # Admin can see all notifications if they request it
            return Notification.objects.all().order_by('-created_at')
        return Notification.objects.filter(user=user).order_by('-created_at')
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request):
        """Mark notifications as read"""
        notification_ids = request.data.get('ids', [])
        if not notification_ids:
            return Response({"detail": "Notification IDs are required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Only update notifications that belong to the user
        notifications = Notification.objects.filter(id__in=notification_ids, user=request.user)
        notifications.update(is_read=True)
        
        return Response({"detail": f"{notifications.count()} notifications marked as read"})
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def unread_count(self, request):
        """Return count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})

# Import throttling classes
from .throttling import LoginRateThrottle, RegisterRateThrottle
import logging

# Setup logger
logger = logging.getLogger('django.security')

# Authentication views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Login view with rate limiting and security logging
    """
    # Apply rate throttling
    throttle = LoginRateThrottle()
    if not throttle.allow_request(request, login_view):
        logger.warning(f"Login rate limit exceeded for IP {throttle.get_ident(request)}")
        return Response(
            {"detail": "Too many login attempts. Please try again later."}, 
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Input validation
    if not username or not password:
        return Response(
            {"detail": "Username and password are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Attempt authentication
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Log successful login
        logger.info(f"Successful login for user: {username}")
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        # Log failed login attempt
        logger.warning(f"Failed login attempt for username: {username}")
        # Use a consistent response time to prevent timing attacks
        import time
        time.sleep(1)  # Delay response to prevent timing attacks
        return Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Registration view with rate limiting and security logging
    """
    # Apply rate throttling
    throttle = RegisterRateThrottle()
    if not throttle.allow_request(request, register_view):
        logger.warning(f"Registration rate limit exceeded for IP {throttle.get_ident(request)}")
        return Response(
            {"detail": "Too many registration attempts. Please try again later."}, 
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Input validation with additional security checks
    # These checks are in addition to what's in UserSerializer
    email = request.data.get('email', '')
    username = request.data.get('username', '')
    
    # Check if user already exists to prevent enumeration attacks
    if User.objects.filter(username=username).exists():
        # Use a consistent response time
        import time
        time.sleep(1)
        logger.info(f"Registration attempt with existing username: {username}")
        return Response(
            {"username": ["A user with that username already exists."]},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        # Use a consistent response time
        import time
        time.sleep(1)
        logger.info(f"Registration attempt with existing email: {email}")
        return Response(
            {"email": ["A user with that email already exists."]},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Log successful registration
        logger.info(f"New user registered: {user.username} (ID: {user.id})")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Log validation errors
    logger.info(f"Registration validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)