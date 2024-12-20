export type TradingPair = {
  base: string;
  quote: string;
  price: number;
  change24h: number;
  volume24h: number;
};

export type Order = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: string;
  rateType: 'fixed' | 'dynamic';
  depositAddress: string;
  recipientAddress: string;
  status: 'awaiting_payment' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  receiveAmount?: string;
  txHash?: string;
  completedAt?: number;
  failureReason?: string;
};

export type OrderStore = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => string;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
};