import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const message =
    searchParams.get('message') || searchParams.get('error') || 'Đã xảy ra lỗi trong quá trình thanh toán.';
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode') || searchParams.get('order_code') || orderId;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-center px-4">
      <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
      <p className="text-lg mt-4">{message}</p>
      {orderCode && <p className="text-sm mt-2">Order ID: {orderCode}</p>}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="/" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
          Back to Home
        </a>
        <a href="/cart" className="px-4 py-2 bg-white text-red-700 border border-red-500 rounded hover:bg-red-50">
          Back to Cart
        </a>
      </div>
    </div>
  );
};

export default PaymentError;
