import { TradingPair } from '../types';

const BINANCE_API = 'https://api.binance.com/api/v3';
const KRAKEN_API = 'https://api.kraken.com/0/public';

// Mapping of our trading pairs to exchange-specific symbols
const BINANCE_PAIRS = {
  'XMR/BTC': 'XMRBTC',
  'LTC/BTC': 'LTCBTC',
};

const KRAKEN_PAIRS = {
  'XMR/BTC': 'XMRXBT',
  'LTC/BTC': 'LTCXBT',
};

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error('Binance API error');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.warn('Binance fetch failed:', error);
    return null;
  }
}

async function fetchKrakenPrice(pair: string): Promise<number | null> {
  try {
    const response = await fetch(`${KRAKEN_API}/Ticker?pair=${pair}`);
    if (!response.ok) throw new Error('Kraken API error');
    const data = await response.json();
    if (data.error?.length) throw new Error(data.error[0]);
    const result = data.result[Object.keys(data.result)[0]];
    return parseFloat(result.c[0]); // Current price is in 'c' array
  } catch (error) {
    console.warn('Kraken fetch failed:', error);
    return null;
  }
}

export async function fetchAllRates(): Promise<Record<TradingPair, string>> {
  const rates: Record<TradingPair, string> = {
    'XMR/BTC': '0',
    'BTC/XMR': '0',
    'BTC/LTC': '0',
    'LTC/BTC': '0',
    'XMR/LTC': '0',
    'LTC/XMR': '0',
  };

  // Fetch base pairs from both exchanges
  const [binanceXMRBTC, binanceLTCBTC, krakenXMRBTC, krakenLTCBTC] = await Promise.all([
    fetchBinancePrice(BINANCE_PAIRS['XMR/BTC']),
    fetchBinancePrice(BINANCE_PAIRS['LTC/BTC']),
    fetchKrakenPrice(KRAKEN_PAIRS['XMR/BTC']),
    fetchKrakenPrice(KRAKEN_PAIRS['LTC/BTC']),
  ]);

  // Calculate averages for base pairs
  const xmrBtcRate = calculateAverage([binanceXMRBTC, krakenXMRBTC]);
  const ltcBtcRate = calculateAverage([binanceLTCBTC, krakenLTCBTC]);

  if (xmrBtcRate && ltcBtcRate) {
    // Set direct rates
    rates['XMR/BTC'] = xmrBtcRate.toFixed(8);
    rates['LTC/BTC'] = ltcBtcRate.toFixed(8);

    // Calculate inverse rates
    rates['BTC/XMR'] = (1 / xmrBtcRate).toFixed(8);
    rates['BTC/LTC'] = (1 / ltcBtcRate).toFixed(8);

    // Calculate cross rates
    const xmrLtcRate = xmrBtcRate / ltcBtcRate;
    rates['XMR/LTC'] = xmrLtcRate.toFixed(8);
    rates['LTC/XMR'] = (1 / xmrLtcRate).toFixed(8);
  }

  return rates;
}

function calculateAverage(rates: (number | null)[]): number | null {
  const validRates = rates.filter((rate): rate is number => rate !== null);
  if (validRates.length === 0) return null;
  return validRates.reduce((a, b) => a + b, 0) / validRates.length;
}