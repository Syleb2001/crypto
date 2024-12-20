const express = require('express');
const compression = require('compression');
const path = require('path');
const https = require('https');
const fs = require('fs');

// Import middleware
const securityMiddleware = require('./middleware/security');
const corsMiddleware = require('./middleware/cors');
const { errorHandler, notFoundHandler } = require('./middleware/error');

// Import routes
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Changed to allow external access

// Apply middleware
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(compression());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV === 'production') {
  try {
    // SSL configuration for HTTPS
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, HOST, () => {
      console.log(`HTTPS Server running at https://${HOST}:${PORT}`);
    });
  } catch (error) {
    // Fallback to HTTP if SSL certificates are not available
    console.warn('SSL certificates not found, falling back to HTTP');
    app.listen(PORT, HOST, () => {
      console.log(`HTTP Server running at http://${HOST}:${PORT}`);
    });
  }
} else {
  // Development server
  app.listen(PORT, HOST, () => {
    console.log(`Development server running at http://${HOST}:${PORT}`);
  });
}