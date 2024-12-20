const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const BINANCE_API = 'https://api.binance.com/api/v3';
const KRAKEN_API = 'https://api.kraken.com/0/public';
const MEMPOOL_API = 'https://mempool.space/api/v1';

// Cache for rate limiting
const cache = {
  rates: { data: null, timestamp: 0 },
  fees: { data: null, timestamp: 0 }
};

// Cache duration in milliseconds
const CACHE_DURATION = 30000; // 30 seconds

async function fetchWithTimeout(url, options = {}) {
  const timeout = options.timeout || 5000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Proxy route for exchange rates
router.get('/rates', async (req, res) => {
  try {
    // Check cache
    if (cache.rates.data && Date.now() - cache.rates.timestamp < CACHE_DURATION) {
      return res.json(cache.rates.data);
    }

    // Fetch from multiple sources
    const [binanceXMR, binanceLTC, krakenXMR, krakenLTC] = await Promise.all([
      fetchWithTimeout(`${BINANCE_API}/ticker/price?symbol=XMRBTC`),
      fetchWithTimeout(`${BINANCE_API}/ticker/price?symbol=LTCBTC`),
      fetchWithTimeout(`${KRAKEN_API}/Ticker?pair=XMRXBT`),
      fetchWithTimeout(`${KRAKEN_API}/Ticker?pair=LTCXBT`)
    ]);

    const [binanceXMRData, binanceLTCData, krakenXMRData, krakenLTCData] = await Promise.all([
      binanceXMR.json(),
      binanceLTC.json(),
      krakenXMR.json(),
      krakenLTC.json()
    ]);

    // Process and normalize data
    const rates = calculateRates(binanceXMRData, binanceLTCData, krakenXMRData, krakenLTCData);
    
    // Update cache
    cache.rates = {
      data: rates,
      timestamp: Date.now()
    };

    res.json(rates);
  } catch (error) {
    console.error('Proxy error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Proxy route for BTC network fees
router.get('/btc-fees', async (req, res) => {
  try {
    // Check cache
    if (cache.fees.data && Date.now() - cache.fees.timestamp < CACHE_DURATION) {
      return res.json(cache.fees.data);
    }

    const response = await fetchWithTimeout(`${MEMPOOL_API}/fees/recommended`);
    const data = await response.json();

    const fees = {
      normal: (data.halfHourFee * 250) / 100000000,
      fast: (data.fastestFee * 250) / 100000000
    };

    // Update cache
    cache.fees = {
      data: fees,
      timestamp: Date.now()
    };

    res.json(fees);
  } catch (error) {
    console.error('Proxy error fetching BTC fees:', error);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
});

function calculateRates(binanceXMR, binanceLTC, krakenXMR, krakenLTC) {
  const xmrBtcRate = calculateAverage([
    parseFloat(binanceXMR.price),
    parseFloat(krakenXMR.result?.XXMRXXBT?.c?.[0] || 0)
  ]);

  const ltcBtcRate = calculateAverage([
    parseFloat(binanceLTC.price),
    parseFloat(krakenLTC.result?.XLTCXXBT?.c?.[0] || 0)
  ]);

  return {
    'XMR/BTC': xmrBtcRate.toFixed(8),
    'BTC/XMR': (1 / xmrBtcRate).toFixed(8),
    'LTC/BTC': ltcBtcRate.toFixed(8),
    'BTC/LTC': (1 / ltcBtcRate).toFixed(8),
    'XMR/LTC': (xmrBtcRate / ltcBtcRate).toFixed(8),
    'LTC/XMR': (ltcBtcRate / xmrBtcRate).toFixed(8)
  };
}

function calculateAverage(rates) {
  const validRates = rates.filter(rate => rate && !isNaN(rate));
  if (validRates.length === 0) return 0;
  return validRates.reduce((a, b) => a + b, 0) / validRates.length;
}

module.exports = router;