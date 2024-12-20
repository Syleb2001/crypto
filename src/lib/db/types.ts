export interface Order {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: string;
  rateType: 'fixed' | 'dynamic';
  depositAddress: string;
  recipientAddress: string;
  status: 'awaiting_payment' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  receiveAmount?: string;
  txHash?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface Rate {
  pair: string;
  rate: string;
  lastUpdate: string;
  change24h: number;
  volume24h: number;
}

export interface Reserve {
  currency: string;
  amount: string;
  lastUpdate: string;
}

export interface Schema {
  orders: Order[];
  rates: Rate[];
  reserves: Reserve[];
}