import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

// Proxy configuration for external APIs
const binanceProxy = createProxyMiddleware({
  target: 'https://api.binance.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/binance': '/api/v3'
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['x-proxy-by'] = 'cryptoswap';
  }
});

const krakenProxy = createProxyMiddleware({
  target: 'https://api.kraken.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/kraken': '/0/public'
  }
});

// Cache for rate limiting
const cache = {
  rates: { data: null, timestamp: 0 },
  fees: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 30000; // 30 seconds

// Routes
router.get('/rates', async (req, res) => {
  try {
    if (cache.rates.data && Date.now() - cache.rates.timestamp < CACHE_DURATION) {
      return res.json(cache.rates.data);
    }

    const [binanceXMR, binanceLTC] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=XMRBTC'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC')
    ]);

    const [xmrData, ltcData] = await Promise.all([
      binanceXMR.json(),
      binanceLTC.json()
    ]);

    const rates = {
      'XMR/BTC': xmrData.price,
      'BTC/XMR': (1 / parseFloat(xmrData.price)).toFixed(8),
      'LTC/BTC': ltcData.price,
      'BTC/LTC': (1 / parseFloat(ltcData.price)).toFixed(8),
      'XMR/LTC': (parseFloat(xmrData.price) / parseFloat(ltcData.price)).toFixed(8),
      'LTC/XMR': (parseFloat(ltcData.price) / parseFloat(xmrData.price)).toFixed(8)
    };

    cache.rates = {
      data: rates,
      timestamp: Date.now()
    };

    res.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Use proxies for direct API access if needed
router.use('/binance', binanceProxy);
router.use('/kraken', krakenProxy);

export default router;