import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// In-memory cache for prices
let priceCache = {
  timestamp: 0,
  prices: {},
};

// WebSocket connections for real-time updates
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify(priceCache));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Fetch prices from multiple sources and aggregate them
async function fetchPrices() {
  try {
    // Fetch BTC/USD price as reference
    const btcResp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
    const btcData = await btcResp.json();
    const btcUsdPrice = parseFloat(btcData.data.amount);

    // Fetch XMR/BTC price
    const xmrResp = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=XMRBTC');
    const xmrData = await xmrResp.json();
    const xmrBtcPrice = parseFloat(xmrData.price);

    // Fetch LTC/BTC price
    const ltcResp = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC');
    const ltcData = await ltcResp.json();
    const ltcBtcPrice = parseFloat(ltcData.price);

    // Calculate all pairs
    const prices = {
      'XMR/BTC': xmrBtcPrice.toFixed(8),
      'BTC/XMR': (1 / xmrBtcPrice).toFixed(8),
      'LTC/BTC': ltcBtcPrice.toFixed(8),
      'BTC/LTC': (1 / ltcBtcPrice).toFixed(8),
      'XMR/LTC': (xmrBtcPrice / ltcBtcPrice).toFixed(8),
      'LTC/XMR': (ltcBtcPrice / xmrBtcPrice).toFixed(8),
    };

    // Update cache
    priceCache = {
      timestamp: Date.now(),
      prices,
    };

    // Broadcast to all connected clients
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(priceCache));
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
}

// Update prices every minute
setInterval(fetchPrices, 60000);

// REST endpoints
app.get('/prices', async (req, res) => {
  try {
    // If cache is older than 1 minute, fetch new prices
    if (Date.now() - priceCache.timestamp > 60000) {
      priceCache.prices = await fetchPrices();
    }
    res.json(priceCache);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.listen(port, () => {
  console.log(`Price relay API running at http://localhost:${port}`);
  fetchPrices(); // Initial fetch
});