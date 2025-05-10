import { useEffect, useState } from 'react';
import { CiViewList } from 'react-icons/ci';
import { FaMapLocationDot } from 'react-icons/fa6';
import { PiMoneyWavyLight } from 'react-icons/pi';
import { Link, useParams } from 'react-router-dom';
import OrderStatus from './OrderStatusComponent';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useOrder } from '../../services/orderServices';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const OrderDetails = () => {
  // lấy orderId từ url
  const { id } = useParams();

  const { getOrderDetail, orderDetail, isLoadingDetail, isError, error, cancelOrderMutation } = useOrder();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getOrderDetail(id);
    }
  }, [id, getOrderDetail]);

  console.log('orderDetail', orderDetail);

  if (isLoadingDetail) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || 'Failed to fetch order details'}</div>;
  }

  if (!orderDetail) {
    return <div>No order details found.</div>;
  }

  if (orderDetail.status === 'Cancelled') {
    return (
      <section className="container mx-auto py-10 px-4 lg:px-8">
        <div className="bg-red-100 text-red-600 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold">Order Cancelled</h2>
          <p className="text-lg mt-4">This order has been cancelled and is no longer available.</p>
          <Link to="/my-orders">
            <button className="mt-6 bg-black text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-800 transition">
              Back to My Orders
            </button>
          </Link>
        </div>
      </section>
    );
  }

  const slidesPerView = window.innerWidth > 1024 ? 4 : window.innerWidth > 600 ? 4 : 3;

  const handleCancelOrder = async () => {
    cancelOrderMutation(orderDetail._id);
    setIsCancelModalOpen(false);
  };
  // Hàm định dạng giá tiền
  const formatCash = (value) => {
    if (!value && value !== 0) return '';
    const numValue = Number(value.toString().replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(numValue);
  };
  const formatPrice = formatCash(orderDetail.items[0]?.price);

  const formattedTotalPrice = formatCash(orderDetail?.totalPrice);

  const shippingFee = formatCash(orderDetail.shippingAddress.shippingFee);
  const distance = orderDetail.shippingAddress.distance
    ? `${orderDetail.shippingAddress.distance.toFixed(2)} km`
    : 'N/A';

  return (
    <>
      <section className="container mx-auto py-10 px-4 lg:px-8">
        <section className="statusOrder flex bg-red-500 p-6 items-center rounded-t-lg text-white gap-6 shadow-md">
          <div className="icon text-[50px]">
            <CiViewList />
          </div>
          <div className="details text-[16px]">
            <p className="font-bold text-lg">Order Status: {orderDetail.status}</p>
            <p className="text-sm">Description</p>
          </div>
        </section>
        <section className="statusOrder flex bg-white p-6 items-center rounded-b-lg text-black gap-6 shadow-md">
          <div className="icon text-[50px]">
            <FaMapLocationDot />
          </div>
          <div className="details text-[16px]">
            <p className="font-bold text-lg">Shipping Address</p>
            <p className="text-sm">Full Name: {orderDetail.shippingAddress.fullName}</p>
            <p className="text-sm">Phone: {orderDetail.shippingAddress.phone}</p>
            <p className="text-sm">Address: {orderDetail.shippingAddress.address}</p>
          </div>
        </section>

        <section className="paymentMethod bg-white my-8 rounded-lg p-6 shadow-md">
          <span className="text-[20px] font-bold text-green-600 flex items-center gap-4">
            <PiMoneyWavyLight className="text-[30px] text-green-600" />
            Payment Method
          </span>
          <div className="pt-4">
            <p className="text-[17px] font-medium text-green-600">{orderDetail.payment.method}</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <OrderStatus status={orderDetail.status} />
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="leftPart w-full xl:w-1/2 flex justify-center items-center">
              <img
                className="rounded-xl object-cover max-w-full max-h-[300px]"
                src={orderDetail.items[0]?.images[0]?.url || '/placeholder-image.png'}
                alt={orderDetail.items[0]?.productName || 'Product Image'}
              />
            </div>
            <div className="rightPart w-full xl:w-1/2">
              <div className="flex flex-col gap-4">
                <h2 className="text-[24px] font-bold text-black">{orderDetail.items[0]?.productName}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Size:</span> {orderDetail.items[0]?.size || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Color:</span> {orderDetail.items[0]?.color || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Quantity:</span> {orderDetail.items[0]?.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Price:</span> {formatPrice} đ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Total Price:</span> {formattedTotalPrice} đ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Shipping Fee:</span> {shippingFee} đ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Distance:</span> {distance}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Order ID:</span> {orderDetail._id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Date:</span> {new Date(orderDetail.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Description:</span> Order placed successfully
                </p>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Link to="/my-orders">
                  <button className="border border-gray-300 text-black px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 transition">
                    Back
                  </button>
                </Link>
                <button
                  className={`border px-6 py-2 rounded-lg shadow-md transition ${
                    orderDetail.status === 'Pending'
                      ? 'border-red-500 text-red-500 hover:bg-red-100'
                      : 'border-gray-300 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={orderDetail.status !== 'Pending'}
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[20px] font-bold mb-6">Related Products</h2>
          <HomeCartSlider slidesPerView={slidesPerView} />
        </section>
      </section>

      <Dialog
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        aria-labelledby="cancel-order-dialog-title"
        aria-describedby="cancel-order-dialog-description"
      >
        <DialogTitle id="cancel-order-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-order-dialog-description">
            Are you sure you want to cancel this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCancelModalOpen(false)} color="primary">
            No
          </Button>
          <Button onClick={handleCancelOrder} color="secondary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderDetails;
