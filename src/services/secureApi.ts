import type { TradingPair } from '../types';

// Cache privé pour limiter les appels API
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

// Fonction privée pour les appels API
async function fetchRatesFromExchanges(): Promise<Record<TradingPair, string>> {
  try {
    // Binance API calls
    const [xmrResponse, ltcResponse] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=XMRBTC'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC')
    ]);

    const [xmrData, ltcData] = await Promise.all([
      xmrResponse.json(),
      ltcResponse.json()
    ]);

    const xmrBtcRate = parseFloat(xmrData.price);
    const ltcBtcRate = parseFloat(ltcData.price);

    // Calculer tous les taux de change
    return {
      'XMR/BTC': xmrBtcRate.toFixed(8),
      'BTC/XMR': (1 / xmrBtcRate).toFixed(8),
      'LTC/BTC': ltcBtcRate.toFixed(8),
      'BTC/LTC': (1 / ltcBtcRate).toFixed(8),
      'XMR/LTC': (xmrBtcRate / ltcBtcRate).toFixed(8),
      'LTC/XMR': (ltcBtcRate / xmrBtcRate).toFixed(8)
    };
  } catch (error) {
    console.error('API call failed');
    throw error;
  }
}

// Fonction privée pour les frais BTC
async function fetchBTCNetworkFees() {
  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');
    const data = await response.json();
    
    return {
      normal: (data.halfHourFee * 250) / 100000000,
      fast: (data.fastestFee * 250) / 100000000
    };
  } catch (error) {
    console.error('API call failed');
    throw error;
  }
}

// Fonction publique pour récupérer les taux
export async function fetchExchangeRates(): Promise<Record<TradingPair, string>> {
  const cacheKey = 'rates';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const rates = await fetchRatesFromExchanges();
    cache.set(cacheKey, {
      data: rates,
      timestamp: Date.now()
    });
    return rates;
  } catch {
    return getFallbackRates();
  }
}

// Fonction publique pour récupérer les frais BTC
export async function fetchBTCFees() {
  const cacheKey = 'btcFees';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const fees = await fetchBTCNetworkFees();
    cache.set(cacheKey, {
      data: fees,
      timestamp: Date.now()
    });
    return fees;
  } catch {
    return {
      normal: 0.0001,
      fast: 0.00015
    };
  }
}

// Taux de repli en cas d'erreur
function getFallbackRates(): Record<TradingPair, string> {
  return {
    'XMR/BTC': '0.00684200',
    'BTC/XMR': '146.15789',
    'BTC/LTC': '281.42857',
    'LTC/BTC': '0.00355333',
    'XMR/LTC': '1.92500',
    'LTC/XMR': '0.51948'
  };
}