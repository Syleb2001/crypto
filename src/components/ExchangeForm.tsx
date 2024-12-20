import React, { useState, useEffect } from 'react';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateAddress, getAddressError } from '../utils/validation';
import { useRatesStore } from '../store/ratesStore';
import { useBtcFeesStore } from '../store/btcFeesStore';

const PAIRS = {
  XMR: ['BTC', 'LTC'],
  BTC: ['XMR', 'LTC'],
  LTC: ['BTC', 'XMR'],
};

// Available reserves for each currency
const RESERVES = {
  BTC: 119.51342552,
  XMR: 4320.25362471,
  LTC: 757.81817851,
};

export function ExchangeForm() {
  const navigate = useNavigate();
  const { rates, isLoading, error, updateRates } = useRatesStore();
  const { fees, updateFees } = useBtcFeesStore();
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('XMR');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [rateType, setRateType] = useState<'fixed' | 'dynamic'>('fixed');
  const [btcSpeed, setBtcSpeed] = useState<'normal' | 'fast'>('normal');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (toCurrency === 'BTC') {
      updateFees();
    }
  }, [toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setRecipientAddress('');
    setAddressError('');
    setAmountError('');
    setTouched(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipientAddress(address);
    setAddressError(getAddressError(address, toCurrency));
    setTouched(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    if (value && parseFloat(value) > RESERVES[fromCurrency]) {
      setAmountError(`Amount exceeds available ${fromCurrency} reserves (${RESERVES[fromCurrency]} ${fromCurrency} max)`);
    } else {
      setAmountError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = getAddressError(recipientAddress, toCurrency);
    setAddressError(error);
    setTouched(true);

    if (amount && parseFloat(amount) > 0 && recipientAddress && !error && !amountError) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromCurrency,
            toCurrency,
            amount,
            rate: rates[`${fromCurrency}/${toCurrency}`],
            rateType,
            recipientAddress,
          }),
        });

        if (!response.ok) throw new Error('Failed to create order');
        
        const order = await response.json();
        navigate(`/order/${order.id}`);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
  };

  const currentRate = rates[`${fromCurrency}/${toCurrency}`];
  const estimatedReceiveAmount = amount && currentRate
    ? (parseFloat(amount) * parseFloat(currentRate) * (rateType === 'fixed' ? 0.985 : 0.99)).toFixed(8)
    : '0.00000000';

  return (
    <div className="bg-[#22262e] rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Automatic Cryptocurrency Exchange</h2>
        <button
          onClick={updateRates}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh Rates</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
          Error loading rates: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">From currency</label>
            <select
              value={fromCurrency}
              onChange={(e) => {
                setFromCurrency(e.target.value);
                setAmountError('');
              }}
              className="w-full bg-[#2c313c] border border-gray-700 rounded-lg p-3 text-white"
              required
            >
              {Object.keys(PAIRS).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className={`w-full bg-[#2c313c] border ${
                amountError ? 'border-red-500' : 'border-gray-700'
              } rounded-lg p-3 text-white`}
              required
              min="0"
              step="any"
            />
            {amountError && (
              <div className="text-sm text-red-500">{amountError}</div>
            )}
            {amount && currentRate && !amountError && (
              <div className="text-sm text-gray-400">
                ≈ {estimatedReceiveAmount} {toCurrency}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwapCurrencies}
            className="p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          >
            <ArrowDownUp className="h-6 w-6 text-blue-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">To currency</label>
            <select
              value={toCurrency}
              onChange={(e) => {
                setToCurrency(e.target.value);
                setRecipientAddress('');
                setAddressError('');
                setTouched(false);
              }}
              className="w-full bg-[#2c313c] border border-gray-700 rounded-lg p-3 text-white"
              required
            >
              {PAIRS[fromCurrency].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Recipient address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={handleAddressChange}
              onBlur={() => setTouched(true)}
              placeholder={`Enter ${toCurrency} address`}
              className={`w-full bg-[#2c313c] border ${
                touched && addressError 
                  ? 'border-red-500' 
                  : touched && !addressError && recipientAddress
                  ? 'border-green-500'
                  : 'border-gray-700'
              } rounded-lg p-3 text-white font-mono overflow-x-auto`}
              required
            />
            {touched && addressError && (
              <div className="text-sm text-red-500">
                {addressError}
              </div>
            )}
            {touched && !addressError && recipientAddress && (
              <div className="text-sm text-green-500">
                Valid {toCurrency} address
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRateType('fixed')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              rateType === 'fixed'
                ? 'bg-blue-500 text-white'
                : 'bg-[#2c313c] text-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Fixed rate</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">1.5%</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRateType('dynamic')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              rateType === 'dynamic'
                ? 'bg-blue-500 text-white'
                : 'bg-[#2c313c] text-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Dynamic rate</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">1%</span>
            </div>
          </button>
        </div>

        {toCurrency === 'BTC' && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-2">Blockchain network fee</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setBtcSpeed('normal')}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  btcSpeed === 'normal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c313c] text-gray-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">Normal (~20 min)</span>
                  {fees.normal && (
                    <span className="text-xs opacity-75">
                      {(fees.normal * 1.05).toFixed(8)} BTC
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBtcSpeed('fast')}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  btcSpeed === 'fast'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c313c] text-gray-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">Fast (~10 min)</span>
                  {fees.fast && (
                    <span className="text-xs opacity-75">
                      {(fees.fast * 1.1).toFixed(8)} BTC
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        <button 
          type="submit"
          className={`w-full ${
            touched && (addressError || amountError)
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-medium py-3 px-4 rounded-lg transition-colors`}
          disabled={touched && (!!addressError || !!amountError)}
        >
          Exchange
        </button>
      </form>
    </div>
  );
}