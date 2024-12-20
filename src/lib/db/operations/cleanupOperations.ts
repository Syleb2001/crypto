import { db } from '../instance';

export const cleanupOperations = {
  async cleanup(): Promise<void> {
    const data = await db.getData();
    
    const now = Date.now();
    const ONE_HOUR = 3600000;
    
    Object.entries(data.orders).forEach(([id, order]) => {
      if (order.status === 'awaiting_payment' && now - order.createdAt > ONE_HOUR) {
        delete data.orders[id];
        
        const depositAddress = Object.entries(data.deposits).find(
          ([_, data]) => data.orderId === id
        );
        if (depositAddress) {
          data.deposits[depositAddress[0]] = {
            ...data.deposits[depositAddress[0]],
            isUsed: false,
            orderId: undefined
          };
        }
      }
    });
    
    await db.write();
  }
};