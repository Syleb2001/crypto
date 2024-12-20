import { Low } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';
import type { Schema } from './types';
import { defaultData } from './defaultData';

class Database {
  private static instance: Low<Schema> | null = null;
  private static initPromise: Promise<void> | null = null;

  private constructor() {}

  static async init(): Promise<void> {
    if (!Database.initPromise) {
      Database.initPromise = (async () => {
        const adapter = new LocalStorage<Schema>('db');
        const db = new Low<Schema>(adapter, defaultData);
        await db.read();
        Database.instance = db;
      })();
    }
    return Database.initPromise;
  }

  static async getInstance(): Promise<Low<Schema>> {
    await Database.init();
    if (!Database.instance) {
      throw new Error('Database not initialized');
    }
    return Database.instance;
  }
}

export const db = {
  async read() {
    const instance = await Database.getInstance();
    return instance.data;
  },

  async write() {
    const instance = await Database.getInstance();
    return instance.write();
  },

  async getData() {
    const instance = await Database.getInstance();
    return instance.data;
  }
};