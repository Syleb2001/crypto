import React, { useEffect } from 'react';
import { TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { useRatesStore } from '../store/ratesStore';

const SIMULATED_CHANGES = {
  'XMR/BTC': 2.5,
  'BTC/XMR': -1.2,
  'BTC/LTC': 0.8,
  'LTC/BTC': -0.5,
  'XMR/LTC': 1.7,
  'LTC/XMR': -1.5,
};

export function MarketStats() {
  const { rates, isLoading, error, updateRates } = useRatesStore();

  useEffect(() => {
    updateRates();
  }, []);

  const pairs = [
    { base: 'XMR', quote: 'BTC' },
    { base: 'BTC', quote: 'XMR' },
    { base: 'BTC', quote: 'LTC' },
    { base: 'LTC', quote: 'BTC' },
    { base: 'XMR', quote: 'LTC' },
    { base: 'LTC', quote: 'XMR' },
  ];

  return (
    <div className="bg-[#22262e] rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Market Statistics</h2>
        <button
          onClick={updateRates}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-400 border-b border-gray-800">
              <th className="py-3 text-left">Trading Pair</th>
              <th className="py-3 text-right">Price</th>
              <th className="py-3 text-right">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(({ base, quote }) => {
              const pair = `${base}/${quote}` as keyof typeof rates;
              const rate = rates[pair];
              const change = SIMULATED_CHANGES[pair] || 0;
              const isUp = change >= 0;

              return (
                <tr key={pair} className="border-b border-gray-800">
                  <td className="py-4 font-medium">
                    {base}/{quote}
                  </td>
                  <td className="py-4 text-right font-mono">
                    {rate ? parseFloat(rate).toFixed(8) : '...'}
                  </td>
                  <td className={`py-4 text-right flex items-center justify-end gap-1 ${
                    isUp ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(change)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}