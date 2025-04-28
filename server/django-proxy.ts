import { createProxyMiddleware } from 'http-proxy-middleware';
import { Express, Request, Response, NextFunction } from 'express';
import { spawn } from 'child_process';
import { log } from './vite';

export function setupDjangoProxy(app: Express) {
  // Security middleware specific to Django API routes
  app.use('/api/django', (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious request patterns
    const url = req.url.toLowerCase();
    const suspiciousPatterns = [
      'union select', 
      'exec(', 
      '.php', 
      '../', 
      '<script', 
      'alert(', 
      'document.cookie',
      '.git'
    ];
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
      url.includes(pattern) || JSON.stringify(req.body).toLowerCase().includes(pattern)
    );
    
    if (hasSuspiciousPattern) {
      log(`Blocked suspicious request: ${req.method} ${req.url}`, 'security');
      return res.status(403).json({ message: 'Request blocked for security reasons' });
    }
    
    // Add specific security headers for Django API
    res.setHeader('X-Django-Proxy', 'true');
    
    next();
  });

  // Create a proxy for Django API requests
  const djangoProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/django': '',  // Rewrite path from /api/django to root
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add security-related headers to proxied requests
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
      proxyReq.setHeader('X-Forwarded-Host', req.get('host') || '');
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      
      // Add CSRF token if available
      const csrfToken = req.get('X-CSRF-Token');
      if (csrfToken) {
        proxyReq.setHeader('X-CSRF-Token', csrfToken);
      }
      
      // Log the proxied request
      log(`Proxying ${req.method} ${req.url} to Django`, 'django-proxy');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add additional security headers to responses
      proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
      proxyRes.headers['X-XSS-Protection'] = '1; mode=block';
      delete proxyRes.headers['X-Powered-By']; // Remove potentially revealing header
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'django-proxy');
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(JSON.stringify({ 
        message: 'Django server is not available',
        timestamp: new Date().toISOString()
      }));
    },
  });

  // Apply the proxy middleware to routes under /api/django
  app.use('/api/django', djangoProxy);

  // Return a function to start the Django server
  return () => {
    const djangoServer = spawn('python', ['backend/manage.py', 'runserver', '0.0.0.0:8000'], {
      stdio: 'pipe',
    });

    djangoServer.stdout.on('data', (data) => {
      log(`${data}`, 'django');
    });

    djangoServer.stderr.on('data', (data) => {
      log(`${data}`, 'django-error');
    });

    djangoServer.on('close', (code) => {
      log(`Django server exited with code ${code}`, 'django');
    });

    // Handle process termination
    process.on('SIGINT', () => {
      log('Stopping Django server...', 'django');
      djangoServer.kill();
      process.exit();
    });

    log('Django server started on http://localhost:8000', 'django');
    return djangoServer;
  };
}