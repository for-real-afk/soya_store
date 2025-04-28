from rest_framework import permissions
import logging

# Setup logger
logger = logging.getLogger('django.security')

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and is an admin
        is_admin = bool(request.user and request.user.is_authenticated and request.user.is_admin)
        
        # Log access attempt for admin-only endpoints
        if not is_admin and request.user.is_authenticated:
            logger.warning(f"Non-admin user '{request.user.username}' attempted to access admin-only resource: {request.path}")
        
        return is_admin


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Allow admin users
        if request.user.is_admin:
            return True
            
        # Check if the object has a user field that matches the request user
        if hasattr(obj, 'user'):
            is_owner = obj.user == request.user
            
            # Log unauthorized access attempts
            if not is_owner:
                logger.warning(f"User '{request.user.username}' attempted to access unauthorized resource owned by user ID {obj.user.id}")
                
            return is_owner
            
        return False


class ReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow read-only access.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS