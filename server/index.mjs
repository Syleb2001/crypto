import express from 'express';
import compression from 'compression';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import cors from 'cors';
import { db, dbOperations } from './db/index.mjs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security headers middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  res.removeHeader('ETag');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  
  next();
});

// Apply middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));
app.use(compression());
app.use(express.json());

// API routes
app.get('/api/rates', async (req, res) => {
  await db.read();
  res.json(db.data.rates);
});

app.get('/api/reserves', async (req, res) => {
  await db.read();
  res.json(db.data.reserves);
});

app.get('/api/orders/:id', async (req, res) => {
  const order = await dbOperations.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderId = randomUUID();
    const order = await dbOperations.createOrder({
      id: orderId,
      ...req.body
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const order = await dbOperations.updateOrderStatus(req.params.id, req.body.status);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Serve static files with basic headers only
app.use(express.static(path.join(__dirname, '../dist'), {
  etag: false,
  lastModified: false,
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

// Create HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, HOST, () => {
  console.log(`HTTP Server running at http://${HOST}:${PORT}`);
});

// Try to create HTTPS server if certificates exist
try {
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(443, HOST, () => {
    console.log(`HTTPS Server running at https://${HOST}`);
  });
} catch (error) {
  console.warn('SSL certificates not found, running in HTTP mode only');
}

// Cleanup expired orders every hour
setInterval(async () => {
  try {
    await dbOperations.cleanup();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 3600000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});