import React, { useState } from 'react';
import type { Order } from '../types';

export function TradeForm() {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedPair, setSelectedPair] = useState('XMR/BTC');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const pairs = ['XMR/BTC', 'BTC/XMR', 'BTC/LTC', 'LTC/BTC', 'XMR/LTC', 'LTC/XMR'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      type: orderType,
      amount: parseFloat(amount),
      price: parseFloat(price),
      total: parseFloat(amount) * parseFloat(price),
      pair: selectedPair,
    };
    console.log('Order placed:', order);
    // Here you would typically send the order to your backend
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Place Order</h2>
      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            orderType === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setOrderType('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            orderType === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setOrderType('sell')}
        >
          Sell
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trading Pair
          </label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {pairs.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.00000001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.00000001"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              orderType === 'buy' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
          </button>
        </div>
      </form>
    </div>
  );
}