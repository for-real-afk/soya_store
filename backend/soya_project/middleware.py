import re
import logging
from django.http import HttpResponseForbidden
from django.conf import settings
from datetime import datetime

# Setup logger
logger = logging.getLogger('soya_project.middleware')

class SecurityMiddleware:
    """
    Middleware to add additional security measures to the application.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # SQL injection patterns
        self.sql_patterns = [
            r'(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s',
            r'(\s|^)(UNION|JOIN|OR|AND)\s+SELECT',
            r'--',
            r'/\*.*\*/',
            r';.*$',
        ]
        self.sql_regex = re.compile('|'.join(self.sql_patterns), re.IGNORECASE)
        
        # XSS patterns
        self.xss_patterns = [
            r'<script.*?>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe',
            r'<img.*?onerror',
        ]
        self.xss_regex = re.compile('|'.join(self.xss_patterns), re.IGNORECASE)

    def __call__(self, request):
        # Log basic request info
        self.log_request_info(request)
        
        # Check for SQL injection
        if self.check_for_sql_injection(request):
            self.log_security_incident(request, "SQL Injection attempt detected")
            return HttpResponseForbidden("Potential SQL injection detected")
        
        # Check for XSS
        if self.check_for_xss(request):
            self.log_security_incident(request, "XSS attack attempt detected")
            return HttpResponseForbidden("Potential XSS attack detected")
        
        # Rate limiting check - if enabled in the future
        
        # Add security headers to the response
        response = self.get_response(request)
        self.add_security_headers(response)
        
        return response
    
    def log_request_info(self, request):
        """Log basic information about the request"""
        # Only log if not a static file request
        if not request.path.startswith('/static/') and not request.path.startswith('/media/'):
            logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')} [{request.META.get('HTTP_USER_AGENT', 'Unknown')}]")
    
    def log_security_incident(self, request, message):
        """Log detailed information about a security incident"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_data = {
            'timestamp': timestamp,
            'ip': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
            'path': request.path,
            'method': request.method,
            'user': str(request.user) if hasattr(request, 'user') else 'Anonymous',
            'message': message
        }
        
        logger.warning(f"SECURITY INCIDENT: {message} - Details: {log_data}")
    
    def check_for_sql_injection(self, request):
        """Check for potential SQL injection in request parameters"""
        # Check GET params
        for key, value in request.GET.items():
            if isinstance(value, str) and self.sql_regex.search(value):
                logger.warning(f"SQL Injection pattern detected in GET param '{key}': {value}")
                return True
        
        # Check POST params
        if request.method == 'POST' and request.content_type == 'application/x-www-form-urlencoded':
            for key, value in request.POST.items():
                if isinstance(value, str) and self.sql_regex.search(value):
                    logger.warning(f"SQL Injection pattern detected in POST param '{key}': {value}")
                    return True
        
        # Check JSON body
        if request.content_type == 'application/json' and hasattr(request, 'body'):
            body_str = request.body.decode('utf-8', errors='ignore')
            if self.sql_regex.search(body_str):
                logger.warning(f"SQL Injection pattern detected in JSON body")
                return True
        
        return False
    
    def check_for_xss(self, request):
        """Check for potential XSS in request parameters"""
        # Check GET params
        for key, value in request.GET.items():
            if isinstance(value, str) and self.xss_regex.search(value):
                logger.warning(f"XSS pattern detected in GET param '{key}': {value}")
                return True
        
        # Check POST params
        if request.method == 'POST' and request.content_type == 'application/x-www-form-urlencoded':
            for key, value in request.POST.items():
                if isinstance(value, str) and self.xss_regex.search(value):
                    logger.warning(f"XSS pattern detected in POST param '{key}': {value}")
                    return True
        
        # Check JSON body
        if request.content_type == 'application/json' and hasattr(request, 'body'):
            body_str = request.body.decode('utf-8', errors='ignore')
            if self.xss_regex.search(body_str):
                logger.warning(f"XSS pattern detected in JSON body")
                return True
        
        return False
    
    def add_security_headers(self, response):
        """Add security headers to response"""
        # Content Security Policy
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Enable XSS protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # HTTP Strict Transport Security (only in production)
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response