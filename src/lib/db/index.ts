import { Low } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';
import type { Schema } from './types';
import { defaultData } from './defaultData';

class Database {
  private static instance: Low<Schema> | null = null;

  static async getInstance(): Promise<Low<Schema>> {
    if (!Database.instance) {
      const adapter = new LocalStorage<Schema>('cryptoswap_db');
      Database.instance = new Low<Schema>(adapter, defaultData);
      await Database.instance.read();
    }
    return Database.instance;
  }
}

export const dbOperations = {
  async createOrder(orderData: any) {
    const db = await Database.getInstance();
    const order = {
      id: crypto.randomUUID(),
      ...orderData,
      createdAt: new Date().toISOString()
    };
    
    db.data.orders.push(order);
    await db.write();
    return order;
  },

  async getOrder(id: string) {
    const db = await Database.getInstance();
    return db.data.orders.find(order => order.id === id);
  },

  async updateOrderStatus(id: string, status: string) {
    const db = await Database.getInstance();
    const order = db.data.orders.find(order => order.id === id);
    if (order) {
      order.status = status;
      await db.write();
    }
    return order;
  },

  async updateRates(rates: any[]) {
    const db = await Database.getInstance();
    db.data.rates = rates;
    await db.write();
    return rates;
  },

  async getRates() {
    const db = await Database.getInstance();
    return db.data.rates;
  },

  async updateReserve(currency: string, amount: string) {
    const db = await Database.getInstance();
    const reserve = db.data.reserves.find(r => r.currency === currency);
    if (reserve) {
      reserve.amount = amount;
      reserve.lastUpdate = new Date().toISOString();
    } else {
      db.data.reserves.push({
        currency,
        amount,
        lastUpdate: new Date().toISOString()
      });
    }
    await db.write();
  },

  async getReserves() {
    const db = await Database.getInstance();
    return db.data.reserves;
  },

  async cleanup() {
    const db = await Database.getInstance();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    db.data.orders = db.data.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return !(order.status === 'awaiting_payment' && orderDate < oneHourAgo);
    });

    await db.write();
  }
};