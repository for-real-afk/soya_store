from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import logging

# Setup logger
logger = logging.getLogger('django.security')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that also returns user data with the token
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = user.is_admin
        
        # Log successful authentication
        logger.info(f"User {user.username} successfully authenticated")
        
        return token
    
    def validate(self, attrs):
        # Call the parent validation to authenticate
        data = super().validate(attrs)
        
        # Add extra user data to response
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['name'] = self.user.name
        data['is_admin'] = self.user.is_admin
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view using the custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer