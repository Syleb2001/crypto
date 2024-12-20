import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Loader2, CheckCircle2, Download, ChevronDown, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '../utils/clipboard';
import { generateGuaranteeLetter, downloadGuaranteeLetter } from '../utils/guaranteeLetter';
import { calculateMinAmount, USD_RATES, formatCryptoAmount } from '../utils/rates';

interface PaymentPageProps {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: string;
  rateType: 'fixed' | 'dynamic';
  recipientAddress: string;
  onBack: () => void;
  existingOrderId?: string;
}

interface CopyState {
  [key: string]: boolean;
}

export function PaymentPage({
  fromCurrency,
  toCurrency,
  amount,
  rate: initialRate,
  rateType,
  recipientAddress,
  onBack,
  existingOrderId
}: PaymentPageProps) {
  const [status, setStatus] = useState<'awaiting_payment' | 'confirming' | 'exchanging' | 'completed'>('awaiting_payment');
  const [incomingTx, setIncomingTx] = useState<string | null>(null);
  const [outgoingTx, setOutgoingTx] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [guaranteeLetter, setGuaranteeLetter] = useState<string>('');
  const [isLetterExpanded, setIsLetterExpanded] = useState(false);

  // Calculate min/max amounts
  const minAmount = calculateMinAmount(fromCurrency as keyof typeof USD_RATES);
  const maxAmount = formatCryptoAmount(fromCurrency === 'BTC' ? 119.51342552 : 
                   fromCurrency === 'XMR' ? 4320.25362471 : 757.81817851);

  useEffect(() => {
    // Simulate order status changes for demo
    if (status === 'awaiting_payment') {
      const timer = setTimeout(() => {
        setStatus('confirming');
        setIncomingTx('7f4c8d9e2a1b3c5d6e8f9a0b1c2d3e4f5a6b7c8d');
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    if (status === 'confirming') {
      const timer = setTimeout(() => {
        setStatus('exchanging');
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (status === 'exchanging') {
      const timer = setTimeout(() => {
        setStatus('completed');
        setOutgoingTx('2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (existingOrderId) {
      const letter = generateGuaranteeLetter(
        existingOrderId,
        fromCurrency,
        toCurrency,
        amount,
        recipientAddress,
        depositAddress,
        new Date().toISOString()
      );
      setGuaranteeLetter(letter);
    }
  }, [existingOrderId, fromCurrency, toCurrency, amount, recipientAddress]);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopyStates({ ...copyStates, [key]: true });
      setTimeout(() => {
        setCopyStates({ ...copyStates, [key]: false });
      }, 2000);
    }
  };

  const handleDownloadLetter = () => {
    if (existingOrderId && guaranteeLetter) {
      downloadGuaranteeLetter(guaranteeLetter, existingOrderId);
    }
  };

  const depositAddress = `${fromCurrency.toLowerCase()}1qzfq9d05tg3qwfha4d20n8xe25h349y18gtenr5`;
  const qrData = `${fromCurrency.toLowerCase()}:${depositAddress}?amount=${amount}`;
  const serviceFeePercentage = rateType === 'fixed' ? 0.015 : 0.01;
  const networkFee = 0.0001;
  const receiveAmount = (parseFloat(amount) * parseFloat(initialRate) * (1 - serviceFeePercentage) - networkFee).toFixed(8);

  return (
    <div className="bg-[#22262e] rounded-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-[#2c313c] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold">Payment Details</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="bg-[#2c313c] p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">Order ID</div>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-blue-400 font-mono">
                {existingOrderId}
              </code>
              <button
                onClick={() => handleCopy(existingOrderId || '', 'orderId')}
                className="p-1.5 rounded-lg hover:bg-[#22262e] transition-colors"
              >
                {copyStates['orderId'] ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[#2c313c] p-6 rounded-lg border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-gray-400 mb-2">Send exactly</div>
              <div className="text-3xl font-mono font-bold text-blue-400 mb-2">
                {amount} {fromCurrency}
              </div>
              <div className="text-sm text-gray-400">
                You will receive approximately {receiveAmount} {toCurrency}
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={qrData}
                  size={160}
                  level="H"
                  includeMargin
                  className="w-40 h-40"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center text-gray-400 text-sm mb-2">
                Send payment to this address:
              </div>
              <div className="relative">
                <div className="bg-[#22262e] border border-gray-700 rounded-lg p-3 pr-12 font-mono text-sm break-all">
                  {depositAddress}
                </div>
                <button
                  onClick={() => handleCopy(depositAddress, 'address')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[#2c313c] transition-colors"
                  title="Copy address"
                >
                  {copyStates['address'] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-center">
                {status === 'awaiting_payment' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10">
                    <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                    <span className="text-yellow-400 text-sm">Awaiting payment...</span>
                  </div>
                )}
                {status === 'confirming' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    <span className="text-blue-400 text-sm">Confirming...</span>
                  </div>
                )}
                {status === 'exchanging' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10">
                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                    <span className="text-purple-400 text-sm">Exchanging...</span>
                  </div>
                )}
                {status === 'completed' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">Transaction completed</span>
                  </div>
                )}
              </div>
            </div>

            {(incomingTx || outgoingTx) && (
              <div className="mt-6 space-y-3">
                {incomingTx && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-400">Incoming TXID:</span>
                      <code className="text-blue-400 font-mono text-sm">
                        {incomingTx}
                      </code>
                      <button
                        onClick={() => handleCopy(incomingTx, 'incomingTx')}
                        className="p-1.5 rounded-lg hover:bg-[#22262e] transition-colors"
                      >
                        {copyStates['incomingTx'] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {outgoingTx && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-400">Outgoing TXID:</span>
                      <code className="text-blue-400 font-mono text-sm">
                        {outgoingTx}
                      </code>
                      <button
                        onClick={() => handleCopy(outgoingTx, 'outgoingTx')}
                        className="p-1.5 rounded-lg hover:bg-[#22262e] transition-colors"
                      >
                        {copyStates['outgoingTx'] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Exchange pair</span>
              <span>{fromCurrency} → {toCurrency}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">Exchange rate</span>
              <div className="flex items-center gap-2">
                <span>1 {fromCurrency} = {initialRate} {toCurrency}</span>
                {rateType === 'dynamic' && (
                  <button
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    title="Update rate"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Exchange mode</span>
              <span>
                {rateType}
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/20">
                  {rateType === 'fixed' ? '1.5%' : '1%'}
                </span>
              </span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Network fee</span>
              <div className="text-right">
                <div>{networkFee} {toCurrency}</div>
                <div className="text-xs text-gray-500">Average blockchain fee</div>
              </div>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">You send</span>
              <span>{amount} {fromCurrency}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">You receive</span>
              <span className="text-green-400">
                {receiveAmount} {toCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Recipient:</span>
              <span className="font-mono text-sm break-all ml-4">{recipientAddress}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-[#2c313c] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setIsLetterExpanded(!isLetterExpanded)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${isLetterExpanded ? 'rotate-180' : ''}`}
                />
                <span>Guarantee Letter</span>
              </button>
              <button
                onClick={handleDownloadLetter}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
            {isLetterExpanded && (
              <div className="bg-[#22262e] p-3 rounded-lg border border-gray-700 mt-3">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all text-gray-400">
                  {guaranteeLetter}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-[#2c313c] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium">Exchange Limits</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#22262e] p-3 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Minimum Amount</div>
                <div className="font-mono">
                  {minAmount} {fromCurrency}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ≈ $10.00
                </div>
              </div>
              <div className="bg-[#22262e] p-3 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Maximum Amount</div>
                <div className="font-mono">
                  {maxAmount} {fromCurrency}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ≈ ${(parseFloat(maxAmount) * USD_RATES[fromCurrency as keyof typeof USD_RATES]).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 text-center">
              If the amount sent is different than {amount} {fromCurrency}, the exchange amount will be recalculated automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}