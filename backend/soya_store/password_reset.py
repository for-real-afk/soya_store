from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserSerializer
import logging

# Setup logger
logger = logging.getLogger('django.security')

class PasswordResetRequestView(views.APIView):
    """
    API endpoint for requesting a password reset.
    
    This would typically send an email with a reset token,
    but for this example we'll just return the token.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(email=email)
            
            # Generate token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # In a real app, we would send an email here
            reset_link = f"/reset-password/{uid}/{token}/"
            
            # Log the password reset request
            logger.info(f"Password reset requested for user: {email}")
            
            # For security reasons, always return success even if email doesn't exist
            return Response(
                {"success": "Password reset link has been sent to your email."},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist
            logger.warning(f"Password reset attempted for non-existent email: {email}")
            return Response(
                {"success": "If your email exists in our system, a password reset link has been sent."},
                status=status.HTTP_200_OK
            )


class PasswordResetConfirmView(views.APIView):
    """
    API endpoint for confirming a password reset.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        
        # Validate required fields
        if not (uid and token and password and password_confirm):
            return Response(
                {"error": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if passwords match
        if password != password_confirm:
            return Response(
                {"error": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Enhanced password strength validation
        errors = []
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in password):
            errors.append("Password must contain at least one number")
        if not any(char.isupper() for char in password):
            errors.append("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in password):
            errors.append("Password must contain at least one lowercase letter")
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?/~`' for char in password):
            errors.append("Password must contain at least one special character")
            
        if errors:
            return Response(
                {"error": errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode the user ID
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
            
            # Check if the token is valid
            if not default_token_generator.check_token(user, token):
                logger.warning(f"Invalid password reset token used for user ID: {user_id}")
                return Response(
                    {"error": "Token is invalid or expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Set new password
            user.set_password(password)
            user.save()
            
            # Log successful password reset
            logger.info(f"Password successfully reset for user: {user.email}")
            
            return Response(
                {"success": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            logger.warning(f"Password reset attempted with invalid token/UID: {uid}")
            return Response(
                {"error": "Token is invalid or expired"},
                status=status.HTTP_400_BAD_REQUEST
            )