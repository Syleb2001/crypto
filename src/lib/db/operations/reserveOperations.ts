import type { Schema } from '../types';
import { db } from '../instance';

export const reserveOperations = {
  async get(): Promise<Schema['reserves']> {
    const data = await db.getData();
    return data.reserves;
  },

  async update(currency: string, amount: string): Promise<void> {
    const data = await db.getData();
    
    data.reserves[currency] = {
      currency,
      amount,
      lastUpdate: Date.now()
    };
    
    await db.write();
  }
};