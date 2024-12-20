import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentPage } from '../components/PaymentPage';

interface Order {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: string;
  rateType: 'fixed' | 'dynamic';
  recipientAddress: string;
  status: string;
  createdAt: string;
}

export function OrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#22262e] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#22262e] rounded-lg p-6 border border-gray-800">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Order Not Found</h2>
            <p className="text-gray-400 mb-4">{error || 'The requested order could not be found.'}</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PaymentPage
        fromCurrency={order.fromCurrency}
        toCurrency={order.toCurrency}
        amount={order.amount}
        rate={order.rate}
        rateType={order.rateType}
        recipientAddress={order.recipientAddress}
        onBack={() => navigate('/')}
        existingOrderId={order.id}
      />
    </div>
  );
}