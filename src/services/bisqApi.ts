import { TradingPair } from '../types';

const BISQ_API_URL = 'https://bisq.markets/api';

export async function fetchBisqMarketPrice(market: string) {
  try {
    const response = await fetch(`${BISQ_API_URL}/markets/${market}/ticker`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.last; // Le dernier prix de trading
  } catch (error) {
    console.error('Error fetching Bisq market price:', error);
    return null;
  }
}

export async function fetchAllBisqRates(): Promise<Partial<Record<TradingPair, string>>> {
  const markets = [
    { pair: 'XMR/BTC', market: 'xmr_btc' },
    { pair: 'LTC/BTC', market: 'ltc_btc' },
  ];

  const rates: Partial<Record<TradingPair, string>> = {};

  await Promise.all(
    markets.map(async ({ pair, market }) => {
      const price = await fetchBisqMarketPrice(market);
      if (price) {
        rates[pair as TradingPair] = price.toString();
        
        // Calculer le taux inverse
        const inversePair = pair.split('/').reverse().join('/') as TradingPair;
        rates[inversePair] = (1 / parseFloat(price)).toString();
      }
    })
  );

  return rates;
}