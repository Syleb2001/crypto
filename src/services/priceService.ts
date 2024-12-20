import { TradingPair } from '../types';
import { fetchExchangeRates } from './secureApi';

let isPolling = false;
let pollInterval: NodeJS.Timeout | null = null;

export function startPriceUpdates(onUpdate: (prices: Record<TradingPair, string>) => void) {
  if (isPolling) return;
  
  isPolling = true;
  
  // Initial fetch
  fetchPrices().then(onUpdate).catch(console.error);
  
  // Set up polling interval
  pollInterval = setInterval(() => {
    fetchPrices().then(onUpdate).catch(console.error);
  }, 30000); // Poll every 30 seconds

  // Cleanup function
  return () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isPolling = false;
  };
}

export async function fetchPrices(): Promise<Record<TradingPair, string>> {
  try {
    return await fetchExchangeRates();
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return getFallbackRates();
  }
}

function getFallbackRates(): Record<TradingPair, string> {
  return {
    'XMR/BTC': '0.00684200',
    'BTC/XMR': '146.15789',
    'BTC/LTC': '281.42857',
    'LTC/BTC': '0.00355333',
    'XMR/LTC': '1.92500',
    'LTC/XMR': '0.51948',
  };
}