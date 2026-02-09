import { useEffect, useState } from 'react';
import { CiViewList } from 'react-icons/ci';
import { FaMapLocationDot } from 'react-icons/fa6';
import { PiMoneyWavyLight } from 'react-icons/pi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OrderStatus from './OrderStatusComponent';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useOrder } from '../../services/orderServices';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import useStore from '../../store/useStore';

const OrderDetails = () => {
  // lấy orderId từ url
  const { id } = useParams();

  const { getOrderDetail, orderDetail, isLoadingDetail, isError, error, cancelOrderMutation } = useOrder();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const navigate = useNavigate();
  const userInfo = useStore((state) => state.userInfo);

  useEffect(() => {
    if (id) {
      getOrderDetail(id);
    }
  }, [id, getOrderDetail]);

  if (isLoadingDetail) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || 'Failed to fetch order details'}</div>;
  }

  if (!orderDetail) {
    return <div>No order details found.</div>;
  }

  const slidesPerView = window.innerWidth > 1024 ? 4 : window.innerWidth > 600 ? 4 : 3;

  const handleCancelOrder = async () => {
    console.log('userInfo', userInfo.bankInfo);

    // Kiểm tra thông tin ngân hàng trong userInfo
    if (
      !userInfo ||
      !userInfo.bankInfo ||
      !userInfo.bankInfo.accountHolderName ||
      !userInfo.bankInfo.accountNumber ||
      !userInfo.bankInfo.bankName
    ) {
      setShowBankModal(true);
      return;
    }
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
    <div>
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
          <OrderStatus status={orderDetail.status === 'Cancelled' ? 'Cancelled' : orderDetail.status} />
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
                <h2 className="text-[24px] font-bold text-black">{orderDetail.items[0]?.name}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Order Code:</span> {orderDetail.order_code || orderDetail._id}
                </p>
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
                  <span className="font-bold">Shipping Fee:</span> {shippingFee} đ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Distance:</span> {distance}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-bold">Date:</span> {new Date(orderDetail.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-bold">Total Price:</span> {formattedTotalPrice} đ
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                <Link to="/my-orders">
                  <button
                    className="flex items-center justify-center gap-2 border border-gray-300 text-black px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 active:bg-gray-200 transition font-medium min-w-full sm:min-w-[160px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={{ fontWeight: 500, fontSize: '1rem', letterSpacing: 0.2 }}
                  >
                    <span className="hidden sm:inline">Back</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                </Link>
                {orderDetail.status !== 'Cancelled' && (
                  <button
                    className={`border px-6 py-2 rounded-lg shadow-md transition font-medium min-w-[160px] flex items-center justify-center
                      ${
                        orderDetail.status === 'Pending' && !orderDetail.cancelRequest
                          ? 'border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200 focus:ring-2 focus:ring-red-300'
                          : orderDetail.cancelRequest
                          ? 'border-yellow-500 text-yellow-700 bg-yellow-50 cursor-not-allowed'
                          : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      }
                    `}
                    disabled={orderDetail.status !== 'Pending' || orderDetail.cancelRequest}
                    onClick={() => setIsCancelModalOpen(true)}
                    style={{ transition: 'all 0.2s', fontWeight: 500 }}
                  >
                    {orderDetail.cancelRequest ? <>Processing cancellation...</> : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
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
            Cancel
          </Button>
          <Button onClick={handleCancelOrder} color="secondary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showBankModal}
        onClose={() => setShowBankModal(false)}
        aria-labelledby="bank-info-dialog-title"
        aria-describedby="bank-info-dialog-description"
      >
        <DialogTitle id="bank-info-dialog-title">Update Bank Account</DialogTitle>
        <DialogContent>
          <DialogContentText id="bank-info-dialog-description">
            Your bank account information is incomplete. Please update your bank account information to proceed with the
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBankModal(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowBankModal(false);
              navigate('/my-account');
            }}
            color="secondary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderDetails;
