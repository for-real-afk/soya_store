import { createProxyMiddleware } from 'http-proxy-middleware';
import { Express } from 'express';
import { spawn } from 'child_process';
import { log } from './vite';

export function setupDjangoProxy(app: Express) {
  // Create a proxy for Django API requests
  const djangoProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/django': '/api',  // Rewrite path from /api/django to /api
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log the proxied request
      log(`Proxying ${req.method} ${req.url} to Django`, 'django-proxy');
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'django-proxy');
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ message: 'Django server is not available' }));
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