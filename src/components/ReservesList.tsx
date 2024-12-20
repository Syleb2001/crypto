import React from 'react';

const reserves = [
  { currency: 'BTC', amount: '119.51342552' },
  { currency: 'XMR', amount: '4320.25362471' },
  { currency: 'LTC', amount: '757.81817851' },
];

export function ReservesList() {
  return (
    <div className="bg-[#22262e] rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-4">Exchange Reserves</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reserves.map((reserve) => (
          <div
            key={reserve.currency}
            className="bg-[#2c313c] p-4 rounded-lg border border-gray-700"
          >
            <div className="text-sm text-gray-400 mb-1">{reserve.currency} Reserve</div>
            <div className="text-lg font-mono">{reserve.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}