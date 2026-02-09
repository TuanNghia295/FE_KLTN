import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Đã xảy ra lỗi trong quá trình thanh toán.';
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode') || orderId;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100">
      <h1 className="text-3xl font-bold text-red-600">Thanh toán thất bại</h1>
      <p className="text-lg mt-4">{message}</p>
      {orderCode && <p className="text-sm mt-2">Mã đơn hàng: {orderCode}</p>}
      <a href="/" className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
        Quay lại trang chủ
      </a>
    </div>
  );
};

export default PaymentError;
