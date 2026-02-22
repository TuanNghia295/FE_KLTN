import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode') || searchParams.get('order_code') || orderId;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100 text-center px-4">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful</h1>
      <p className="text-lg mt-4">Thank you for your purchase!</p>
      {orderCode && <p className="text-sm mt-2">Order ID: {orderCode}</p>}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={`/my-orders/order/${orderId || orderCode || ''}`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          View Order Details
        </a>
        <a href="/" className="px-4 py-2 bg-white text-green-700 border border-green-500 rounded hover:bg-green-50">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;