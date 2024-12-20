import { nanoid } from 'nanoid';
import type { Order } from '../types';
import { db } from '../instance';

export const orderOperations = {
  async create(orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'depositAddress'>): Promise<Order> {
    const data = await db.getData();
    
    const orderId = nanoid(16);
    const depositAddress = await this.getUnusedDepositAddress(orderData.fromCurrency);
    
    if (!depositAddress) {
      throw new Error(`No available deposit addresses for ${orderData.fromCurrency}`);
    }

    const order: Order = {
      id: orderId,
      ...orderData,
      depositAddress,
      status: 'awaiting_payment',
      createdAt: Date.now(),
    };

    data.orders[orderId] = order;
    data.deposits[depositAddress] = {
      ...data.deposits[depositAddress],
      isUsed: true,
      orderId
    };
    
    await db.write();
    return order;
  },

  async get(id: string): Promise<Order | null> {
    const data = await db.getData();
    return data.orders[id] || null;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    const data = await db.getData();
    
    const order = data.orders[id];
    if (!order) return null;

    order.status = status;
    await db.write();
    
    return order;
  },

  async list(limit = 50, offset = 0): Promise<Order[]> {
    const data = await db.getData();
    return Object.values(data.orders)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(offset, offset + limit);
  },

  async getByDepositAddress(address: string): Promise<Order | null> {
    const data = await db.getData();
    const deposit = data.deposits[address];
    if (!deposit?.orderId) return null;
    return data.orders[deposit.orderId] || null;
  },

  async getUnusedDepositAddress(currency: string): Promise<string | null> {
    const data = await db.getData();
    
    const availableAddress = Object.entries(data.deposits).find(
      ([_, data]) => data.currency === currency && !data.isUsed
    );
    
    return availableAddress ? availableAddress[0] : null;
  }
};