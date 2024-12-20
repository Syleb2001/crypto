export const defaultData = {
  orders: {},
  rates: [
    {
      pair: 'XMR/BTC',
      rate: '0.00684200',
      lastUpdate: new Date().toISOString(),
      change24h: 2.5,
      volume24h: 156.23
    },
    {
      pair: 'BTC/XMR',
      rate: '146.15789',
      lastUpdate: new Date().toISOString(),
      change24h: -1.2,
      volume24h: 892.45
    },
    {
      pair: 'LTC/BTC',
      rate: '0.00355333',
      lastUpdate: new Date().toISOString(),
      change24h: -0.5,
      volume24h: 445.67
    },
    {
      pair: 'BTC/LTC',
      rate: '281.42857',
      lastUpdate: new Date().toISOString(),
      change24h: 0.8,
      volume24h: 723.12
    },
    {
      pair: 'XMR/LTC',
      rate: '1.92500',
      lastUpdate: new Date().toISOString(),
      change24h: 1.7,
      volume24h: 234.56
    },
    {
      pair: 'LTC/XMR',
      rate: '0.51948',
      lastUpdate: new Date().toISOString(),
      change24h: -1.5,
      volume24h: 178.90
    }
  ],
  reserves: [
    {
      currency: 'BTC',
      amount: '119.51342552',
      lastUpdate: new Date().toISOString()
    },
    {
      currency: 'XMR',
      amount: '4320.25362471',
      lastUpdate: new Date().toISOString()
    },
    {
      currency: 'LTC',
      amount: '757.81817851',
      lastUpdate: new Date().toISOString()
    }
  ]
};