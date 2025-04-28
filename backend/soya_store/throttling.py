from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
import logging
from django.core.cache import cache

# Setup logger
logger = logging.getLogger('django.security')

class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle class specifically for login attempts.
    More strict than the general rate limits.
    """
    scope = 'login'
    rate = '5/minute'  # Stricter rate for login attempts
    
    def get_cache_key(self, request, view):
        # Use the IP address and username as the cache key
        username = request.data.get('username', '')
        ip = self.get_ident(request)
        
        if len(username) > 0:
            # Log excessive login attempts
            key = f'login_attempt_{ip}_{username}'
            attempts = cache.get(key, 0)
            
            # Increment the counter
            cache.set(key, attempts + 1, 60 * 60)  # 1 hour expiration
            
            # Log suspicious activity
            if attempts >= 3:
                logger.warning(f"Multiple login attempts detected for username '{username}' from IP {ip} - {attempts+1} attempts")
                
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"{ip}_{username}"
            }
        return self.cache_format % {
            'scope': self.scope,
            'ident': ip
        }


class RegisterRateThrottle(AnonRateThrottle):
    """
    Throttle class specifically for registration attempts.
    To prevent spamming of user accounts.
    """
    scope = 'register'
    rate = '3/hour'  # Very strict rate for registration
    
    def get_cache_key(self, request, view):
        ip = self.get_ident(request)
        
        # Log excessive registration attempts
        key = f'register_attempt_{ip}'
        attempts = cache.get(key, 0)
        
        # Increment the counter
        cache.set(key, attempts + 1, 60 * 60 * 24)  # 24 hour expiration
        
        # Log suspicious activity
        if attempts >= 2:
            logger.warning(f"Multiple registration attempts detected from IP {ip} - {attempts+1} attempts")
            
        return self.cache_format % {
            'scope': self.scope,
            'ident': ip
        }