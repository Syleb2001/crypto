export function generateGuaranteeLetter(
  orderId: string,
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  recipientAddress: string,
  depositAddress: string,
  createdAt: string
): string {
  const date = new Date(createdAt).toUTCString();
  return `-----BEGIN ${fromCurrency} SIGNED MESSAGE-----
This is a proof of the exchange order ${orderId} created at CryptoSwap (https://cryptoswap.com) on ${date} to receive user's ${fromCurrency} at ${depositAddress} and send ${toCurrency} to ${recipientAddress}. Amount to be exchanged: ${amount} ${fromCurrency}. This message was generated on ${date}
-----BEGIN SIGNATURE-----
${depositAddress}
H8KzBsKteL+xn/X65jmY8ieC3KHev22hWooBy1IeTEfTXcro41twOsjvFf9k9B7bcLJxPNwNL3CBrk6L/a7vi3M=
-----END ${fromCurrency} SIGNED MESSAGE-----`;
}

export function downloadGuaranteeLetter(content: string, orderId: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `guarantee-letter-${orderId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}