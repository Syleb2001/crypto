import { create } from 'zustand';
import { fetchBTCFees } from '../services/secureApi';

interface BtcFeesStore {
  fees: {
    normal: number;
    fast: number;
  };
  isLoading: boolean;
  error: string | null;
  updateFees: () => Promise<void>;
}

export const useBtcFeesStore = create<BtcFeesStore>((set) => ({
  fees: {
    normal: 0.0001,
    fast: 0.00015,
  },
  isLoading: false,
  error: null,
  updateFees: async () => {
    set({ isLoading: true, error: null });
    try {
      const fees = await fetchBTCFees();
      set({ fees, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch BTC fees',
        isLoading: false,
      });
    }
  },
}));