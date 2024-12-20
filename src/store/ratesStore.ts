import { create } from 'zustand';
import type { TradingPair } from '../types';
import { startPriceUpdates, fetchPrices } from '../services/priceService';

interface RatesStore {
  rates: Record<TradingPair, string>;
  isLoading: boolean;
  error: string | null;
  updateRates: () => Promise<void>;
}

export const useRatesStore = create<RatesStore>((set) => {
  // Start price updates when store is created
  startPriceUpdates((prices) => {
    set({ rates: prices, isLoading: false, error: null });
  });

  return {
    rates: {
      'XMR/BTC': '0.00684200',
      'BTC/XMR': '146.15789',
      'BTC/LTC': '281.42857',
      'LTC/BTC': '0.00355333',
      'XMR/LTC': '1.92500',
      'LTC/XMR': '0.51948',
    },
    isLoading: false,
    error: null,
    updateRates: async () => {
      set({ isLoading: true, error: null });
      try {
        const prices = await fetchPrices();
        set({ rates: prices, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch rates',
          isLoading: false,
        });
      }
    },
  };
});