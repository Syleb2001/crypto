import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serverDb = {
  // Order operations
  async createOrder(orderData: any) {
    return prisma.order.create({
      data: orderData
    });
  },

  async getOrder(id: string) {
    return prisma.order.findUnique({
      where: { id }
    });
  },

  async updateOrderStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  },

  // Rate operations
  async updateRates(rates: any[]) {
    return prisma.$transaction(
      rates.map(rate => 
        prisma.rate.upsert({
          where: { pair: rate.pair },
          update: rate,
          create: rate
        })
      )
    );
  },

  // Reserve operations
  async updateReserve(currency: string, amount: string) {
    return prisma.reserve.upsert({
      where: { currency },
      update: {
        amount,
        lastUpdate: new Date()
      },
      create: {
        currency,
        amount,
        lastUpdate: new Date()
      }
    });
  },

  // Cleanup operations
  async cleanup() {
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    return prisma.order.deleteMany({
      where: {
        status: 'awaiting_payment',
        createdAt: {
          lt: oneHourAgo
        }
      }
    });
  }
};