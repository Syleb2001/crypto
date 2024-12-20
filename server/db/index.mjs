import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { defaultData } from './defaultData.mjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, '../../data');
const DB_FILE = join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Create adapter and db instance
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

// Initialize database
await db.read();

// Ensure data structure
if (!db.data) {
  db.data = defaultData;
  await db.write();
}

// Database operations
export const dbOperations = {
  async createOrder(orderData) {
    await db.read();
    
    const order = {
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'awaiting_payment'
    };
    
    // Ensure orders object exists
    if (!db.data.orders) {
      db.data.orders = {};
    }
    
    // Store order with ID as key
    db.data.orders[order.id] = order;
    
    await db.write();
    console.log('Order created:', order); // Debug log
    return order;
  },

  async getOrder(id) {
    await db.read();
    return db.data.orders?.[id] || null;
  },

  async updateOrderStatus(id, status) {
    await db.read();
    const order = db.data.orders?.[id];
    if (order) {
      order.status = status;
      if (status === 'completed') {
        order.completedAt = new Date().toISOString();
      }
      await db.write();
    }
    return order || null;
  },

  async listOrders(limit = 50, offset = 0) {
    await db.read();
    return Object.values(db.data.orders || {})
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  },

  async cleanup() {
    await db.read();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const orders = db.data.orders || {};
    let cleaned = false;
    
    for (const [id, order] of Object.entries(orders)) {
      if (order.status === 'awaiting_payment' && new Date(order.createdAt) < oneHourAgo) {
        delete orders[id];
        cleaned = true;
      }
    }

    if (cleaned) {
      await db.write();
    }
  }
};

export { db };