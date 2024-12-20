// Bitcoin address regex (supports legacy, segwit, and native segwit)
export const BTC_ADDRESS_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{11,71})$/;

// Litecoin address regex (supports legacy, segwit, and native segwit)
export const LTC_ADDRESS_REGEX = /^([LM3][a-km-zA-HJ-NP-Z1-9]{26,33}|ltc1[a-zA-HJ-NP-Z0-9]{11,71})$/;

// Monero address regex (supports standard and integrated addresses)
export const XMR_ADDRESS_REGEX = /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93,104}$/;

export const validateAddress = (address: string, currency: string): boolean => {
  switch (currency) {
    case 'BTC':
      return BTC_ADDRESS_REGEX.test(address);
    case 'LTC':
      return LTC_ADDRESS_REGEX.test(address);
    case 'XMR':
      return XMR_ADDRESS_REGEX.test(address);
    default:
      return false;
  }
};

export const getAddressError = (address: string, currency: string): string => {
  if (!address) return '';
  if (!validateAddress(address, currency)) {
    return `Invalid ${currency} address format`;
  }
  return '';
};