import { API_CONFIG, PAIRS } from '../../config/api';

class ExchangeService {
  private static instance: ExchangeService;

  private constructor() {}

  static getInstance(): ExchangeService {
    if (!this.instance) {
      this.instance = new ExchangeService();
    }
    return this.instance;
  }

  async fetchBinancePrice(symbol: string): Promise<number | null> {
    try {
      const response = await fetch(`${API_CONFIG.BINANCE_API}/ticker/price?symbol=${symbol}`);
      if (!response.ok) throw new Error('Binance API error');
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.warn('Binance fetch failed:', error);
      return null;
    }
  }

  async fetchKrakenPrice(pair: string): Promise<number | null> {
    try {
      const response = await fetch(`${API_CONFIG.KRAKEN_API}/Ticker?pair=${pair}`);
      if (!response.ok) throw new Error('Kraken API error');
      const data = await response.json();
      if (data.error?.length) throw new Error(data.error[0]);
      const result = data.result[Object.keys(data.result)[0]];
      return parseFloat(result.c[0]);
    } catch (error) {
      console.warn('Kraken fetch failed:', error);
      return null;
    }
  }

  async getAllRates() {
    const [binanceXMRBTC, binanceLTCBTC, krakenXMRBTC, krakenLTCBTC] = await Promise.all([
      this.fetchBinancePrice(PAIRS.BINANCE['XMR/BTC']),
      this.fetchBinancePrice(PAIRS.BINANCE['LTC/BTC']),
      this.fetchKrakenPrice(PAIRS.KRAKEN['XMR/BTC']),
      this.fetchKrakenPrice(PAIRS.KRAKEN['LTC/BTC']),
    ]);

    const xmrBtcRate = this.calculateAverage([binanceXMRBTC, krakenXMRBTC]);
    const ltcBtcRate = this.calculateAverage([binanceLTCBTC, krakenLTCBTC]);

    if (!xmrBtcRate || !ltcBtcRate) {
      throw new Error('Failed to calculate rates');
    }

    return {
      'XMR/BTC': xmrBtcRate.toFixed(8),
      'BTC/XMR': (1 / xmrBtcRate).toFixed(8),
      'LTC/BTC': ltcBtcRate.toFixed(8),
      'BTC/LTC': (1 / ltcBtcRate).toFixed(8),
      'XMR/LTC': (xmrBtcRate / ltcBtcRate).toFixed(8),
      'LTC/XMR': (ltcBtcRate / xmrBtcRate).toFixed(8),
    };
  }

  private calculateAverage(rates: (number | null)[]): number | null {
    const validRates = rates.filter((rate): rate is number => rate !== null);
    if (validRates.length === 0) return null;
    return validRates.reduce((a, b) => a + b, 0) / validRates.length;
  }
}

export const exchangeService = ExchangeService.getInstance();