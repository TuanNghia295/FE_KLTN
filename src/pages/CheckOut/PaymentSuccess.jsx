import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode') || orderId;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-3xl font-bold text-green-600">Thanh toán thành công</h1>
      <p className="text-lg mt-4">Cảm ơn bạn đã mua hàng!</p>
      {orderCode && <p className="text-sm mt-2">Mã đơn hàng: {orderCode}</p>}
      <a
        href={`/my-orders/order/${orderId}`}
        className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Xem chi tiết đơn hàng
      </a>
    </div>
  );
};

export default PaymentSuccess;