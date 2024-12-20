import { orderOperations } from './db/operations/orderOperations';
import { rateOperations } from './db/operations/rateOperations';
import { reserveOperations } from './db/operations/reserveOperations';
import { cleanupOperations } from './db/operations/cleanupOperations';
import { db } from './db/instance';

// Initialize cleanup interval
let cleanupInterval: NodeJS.Timeout;

export async function initializeDatabase() {
  try {
    // Initialize database
    await db.read();

    // Clear existing interval if it exists
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }

    // Set up new cleanup interval
    cleanupInterval = setInterval(() => {
      cleanupOperations.cleanup().catch(console.error);
    }, 3600000);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export const dbOperations = {
  ...orderOperations,
  ...rateOperations,
  ...reserveOperations,
  ...cleanupOperations,
};