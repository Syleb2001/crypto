import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { TradingPair } from '../types';

const pairs: TradingPair[] = [
  { base: 'XMR', quote: 'BTC', price: 0.00424, change24h: 2.5, volume24h: 156.23 },
  { base: 'BTC', quote: 'XMR', price: 235.84, change24h: -1.2, volume24h: 892.45 },
  { base: 'BTC', quote: 'LTC', price: 235.84, change24h: 0.8, volume24h: 723.12 },
  { base: 'LTC', quote: 'BTC', price: 0.00424, change24h: -0.5, volume24h: 445.67 },
  { base: 'XMR', quote: 'LTC', price: 1.234, change24h: 1.7, volume24h: 234.56 },
  { base: 'LTC', quote: 'XMR', price: 0.811, change24h: -1.5, volume24h: 178.90 },
];

export function TradingPairs() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Trading Pairs</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2 text-left">Pair</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">24h Change</th>
              <th className="py-2 text-right">24h Volume</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={`${pair.base}${pair.quote}`} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">
                  {pair.base}/{pair.quote}
                </td>
                <td className="py-3 text-right">{pair.price.toFixed(5)}</td>
                <td className={`py-3 text-right flex items-center justify-end gap-1 ${
                  pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {pair.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(pair.change24h)}%
                </td>
                <td className="py-3 text-right">{pair.volume24h.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}