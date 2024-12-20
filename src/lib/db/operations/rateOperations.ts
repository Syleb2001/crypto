import type { Schema } from '../types';
import { db } from '../instance';

export const rateOperations = {
  async get(): Promise<Schema['rates']> {
    const data = await db.getData();
    return data.rates;
  },

  async update(pairs: Record<string, { rate: string; change24h?: number; volume24h?: number }>): Promise<void> {
    const data = await db.getData();
    
    const timestamp = Date.now();
    Object.entries(pairs).forEach(([pair, pairData]) => {
      data.rates.pairs[pair] = {
        rate: pairData.rate,
        lastUpdate: timestamp,
        change24h: pairData.change24h ?? data.rates.pairs[pair]?.change24h ?? 0,
        volume24h: pairData.volume24h ?? data.rates.pairs[pair]?.volume24h ?? 0
      };
    });
    
    data.rates.timestamp = timestamp;
    await db.write();
  }
};