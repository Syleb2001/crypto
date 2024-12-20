import React from 'react';

const mockOrders = {
  asks: [
    { price: 0.00426, amount: 2.5 },
    { price: 0.00425, amount: 1.8 },
    { price: 0.00424, amount: 3.2 },
  ],
  bids: [
    { price: 0.00423, amount: 1.5 },
    { price: 0.00422, amount: 2.7 },
    { price: 0.00421, amount: 4.1 },
  ],
};

export function OrderBook() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      <div className="grid grid-cols-3 text-sm font-medium text-gray-600 mb-2">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>
      <div className="space-y-1">
        {mockOrders.asks.map((order, i) => (
          <div key={i} className="grid grid-cols-3 text-sm text-red-600">
            <div>{order.price.toFixed(5)}</div>
            <div className="text-right">{order.amount.toFixed(3)}</div>
            <div className="text-right">{(order.price * order.amount).toFixed(5)}</div>
          </div>
        ))}
        <div className="border-y border-gray-200 my-2 py-2 text-center font-medium">
          0.00424 BTC
        </div>
        {mockOrders.bids.map((order, i) => (
          <div key={i} className="grid grid-cols-3 text-sm text-green-600">
            <div>{order.price.toFixed(5)}</div>
            <div className="text-right">{order.amount.toFixed(3)}</div>
            <div className="text-right">{(order.price * order.amount).toFixed(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}