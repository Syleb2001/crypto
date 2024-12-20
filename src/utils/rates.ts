// Current exchange rates and USD equivalents
export const EXCHANGE_RATES = {
  'XMR/BTC': '0.00684200',
  'BTC/XMR': '146.15789',
  'BTC/LTC': '281.42857',
  'LTC/BTC': '0.00355333',
  'XMR/LTC': '1.92500',
  'LTC/XMR': '0.51948',
} as const;

// USD rates for calculating minimums (example rates)
export const USD_RATES = {
  BTC: 42000,
  XMR: 280,
  LTC: 150,
} as const;

export type TradingPair = keyof typeof EXCHANGE_RATES;

export function getExchangeRate(fromCurrency: string, toCurrency: string): string {
  const pair = `${fromCurrency}/${toCurrency}` as TradingPair;
  return EXCHANGE_RATES[pair] || '0';
}

export function calculateMinAmount(currency: keyof typeof USD_RATES): string {
  const MIN_USD = 10;
  return (MIN_USD / USD_RATES[currency]).toFixed(8);
}

export function formatCryptoAmount(amount: number | string): string {
  return parseFloat(amount.toString()).toFixed(8);
}

export function calculateReceiveAmount(
  sendAmount: string,
  fromCurrency: string,
  toCurrency: string,
  networkFeePercentage: number = 0.001
): {
  receiveAmount: string;
  networkFee: string;
  rate: string;
} {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  const amount = parseFloat(sendAmount);
  const rateFloat = parseFloat(rate);
  
  const networkFee = (amount * rateFloat * networkFeePercentage).toFixed(8);
  const receiveAmount = (amount * rateFloat - parseFloat(networkFee)).toFixed(8);
  
  return {
    receiveAmount,
    networkFee,
    rate,
  };
}