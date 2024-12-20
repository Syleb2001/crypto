import { create } from 'zustand';
import type { OrderStore, Order } from '../types';
import { dbOperations } from '../lib/db';

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  
  addOrder: async (orderData) => {
    const order = await dbOperations.createOrder(orderData);
    
    set((state) => ({
      orders: [...state.orders, order],
    }));
    
    return order.id;
  },
  
  getOrder: async (id) => {
    const order = await dbOperations.getOrder(id);
    return order || undefined;
  },
  
  updateOrderStatus: async (id, status) => {
    const updatedOrder = await dbOperations.updateOrderStatus(id, status);
    
    if (updatedOrder) {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? updatedOrder : order
        ),
      }));
    }
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
  },
}));