import { useState, useMemo, useEffect, use } from 'react';
import TextField from '@mui/material/TextField';
import { Button, CircularProgress, Box, Typography, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaRegMoneyBill1 } from 'react-icons/fa6';
import useStore from '../../store/useStore';
import { useShippingFee, useCreateOrder } from '../../services/paymentServices.jsx';

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const CheckOut = () => {
  const navigate = useNavigate();
  const cartItems = useStore((state) => state.cartItems);
  const userInfo = useStore((state) => state.userInfo);
  const clearCart = useStore((state) => state.clearCart);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(userInfo?.address[0] || '');

  const paymentOptions = [
    { value: 'Cash', label: 'Payment with cash', icon: <FaRegMoneyBill1 /> },
    { value: 'BankTransfer', label: 'Payment with Bank Transfer/VNPay', icon: <FaCreditCard /> },
  ];

  console.log('userInfo', userInfo);

  const {
    data: shippingData,
    isLoading: isLoadingShippingFee,
    isError: isErrorShippingFee,
    error: shippingError,
    refetch: refetchShippingFee,
  } = useShippingFee(selectedAddress);

  const {
    mutate: createOrderMutate,
    isPending: isCreatingOrder,
    isSuccess: isOrderSuccess,
    isError: isOrderError,
    error: orderError,
    reset: resetCreateOrder,
    // data: orderData, // Không cần orderData nữa
  } = useCreateOrder();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item?.product?.price || 0) * (item.quantity || 0), 0);
  }, [cartItems]);

  const shippingFee = shippingData?.totalFee ?? 0;
  const distance = shippingData?.distance ?? 'N/A';
  const totalAmount = subtotal + shippingFee;

  const handlePaymentChange = (value) => {
    console.log('Selected payment method:', value);

    setSelectedPaymentMethod(value);
  };

  const handlePlaceOrder = () => {
    if (!userInfo || !userInfo._id) {
      setNotification({ open: true, message: 'User information is missing. Please log in again.', severity: 'error' });
      return;
    }
    if (cartItems.length === 0) {
      setNotification({ open: true, message: 'No products in the order.', severity: 'error' });
      return;
    }
    if (isErrorShippingFee) {
      setNotification({
        open: true,
        message: `Cannot place order due to shipping calculation error: ${shippingError?.message || 'Unknown error'}`,
        severity: 'error',
      });
      return;
    }
    if (!selectedPaymentMethod) {
      setNotification({ open: true, message: 'Please select a payment method.', severity: 'warning' });
      return;
    }

    const orderPayload = {
      userId: userInfo?._id,
      customerName: userInfo.fullName,
      customerPhone: userInfo.phone,
      toAddress: selectedAddress,
      items: cartItems.map((item) => ({
        productId: item.product.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      paymentMethod: selectedPaymentMethod,
      note: '',
      isReturn: false,
    };

    console.log('Placing order with payload:', orderPayload);

    // Gọi mutation createOrderMutate
    createOrderMutate(orderPayload);
  };

  useEffect(() => {
    if (isOrderSuccess) {
      setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });
      resetCreateOrder();

      // Reset giỏ hàng sau khi đặt hàng thành công
      clearCart();

      // Chuyển hướng về trang chủ hoặc trang sản phẩm sau 2 giây
      setTimeout(() => {
        navigate('/'); // Hoặc navigate('/products')
      }, 1000);
    }
  }, [isOrderSuccess, navigate, resetCreateOrder, clearCart]);

  useEffect(() => {
    if (isOrderError) {
      setNotification({
        open: true,
        message: `Failed to place order: ${orderError?.message || 'Unknown server error'}`,
        severity: 'error',
      });
      // resetCreateOrder(); // Có thể reset nếu muốn cho phép thử lại
    }
  }, [isOrderError, orderError, resetCreateOrder]);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <section className="section bg-white p-5 relative">
        <div className="container flex flex-col xl:flex-row w-full gap-8 xl:gap-5">
          <div className="leftPart xl:w-[65%] order-2 xl:order-1">
            <h2 className="text-[18px] text-black font-[600] mb-3">BILLING DETAILS</h2>
            <form className="w-full my-3 space-y-4">
              <div className="flex items-center gap-3">
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo?.fullName || ''}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={userInfo?.phone || ''}
                  variant="outlined"
                  size="small"
                />
              </div>
              <div className="flex items-center gap-2">
                <TextField
                  fullWidth
                  label="Address"
                  value={selectedAddress}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
                <Button variant="text" color="error" onClick={() => setShowAddressList(true)}>
                  Change
                </Button>
              </div>
              {showAddressList && (
                <div className="address-list mt-3">
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Select a saved address:
                  </Typography>
                  {userInfo?.address.map((addr, index) => (
                    <Button
                      key={index}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 1, textAlign: 'left' }}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressList(false);
                        refetchShippingFee(addr);
                      }}
                    >
                      {addr}
                    </Button>
                  ))}
                </div>
              )}
            </form>
            <h2 className="text-[18px] text-black font-[600] my-5">PAYMENT METHOD</h2>
            <div className="w-full my-3 space-y-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex items-center p-3 border rounded-md gap-4 cursor-pointer transition ${
                    selectedPaymentMethod === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    id={option.value}
                    type="radio"
                    name="paymentMethod"
                    checked={selectedPaymentMethod === option.value}
                    onChange={() => handlePaymentChange(option.value)}
                    className="hidden"
                  />
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rightPart w-full xl:w-[35%] order-1 xl:order-2 border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-[18px] text-black font-[600] mb-4 border-b pb-2">YOUR ORDER</h2>
            <div className="order-items max-h-60 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={index} className="itemCheckout flex items-center gap-3 text-sm">
                    <img
                      className="rounded w-1/3 h-1/3 object-cover border"
                      src={item?.product?.images[0]?.url || ''}
                      alt={item.name}
                    />
                    <div className="info flex-grow">
                      <h4 className="font-medium text-black line-clamp-1">{item.name}</h4>
                      <p className="text-gray-500">Size: {item.size}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="ml-auto font-medium text-black">
                      {formatCurrency(item?.product?.price * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No items in your order.
                </Typography>
              )}
            </div>
            <div className="price-details space-y-2 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-800 font-medium">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">Shipping ({distance})</p>
                {isLoadingShippingFee ? (
                  <CircularProgress size={16} />
                ) : isErrorShippingFee ? (
                  <Tooltip title={shippingError?.message || 'Error'} placement="top">
                    <span className="text-red-500 cursor-help">Error</span>
                  </Tooltip>
                ) : (
                  <p className="text-gray-800 font-medium">{formatCurrency(shippingFee)}</p>
                )}
              </div>
              <div className="flex items-center justify-between my-3 border-t border-gray-200 pt-3">
                <h4 className="font-bold text-lg text-black">Total</h4>
                <h4 className={`font-bold text-lg ${isErrorShippingFee ? 'text-red-500' : 'text-black'}`}>
                  {isErrorShippingFee ? 'N/A' : formatCurrency(totalAmount)}
                </h4>
              </div>
            </div>
            <div className="w-full mt-5">
              {!userInfo?.address?.[0] && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  Please update your shipping address to place an order.
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handlePlaceOrder} // Gọi handlePlaceOrder khi click
                disabled={isCreatingOrder || isErrorShippingFee || cartItems.length === 0 || !userInfo?.address?.[0]}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': { backgroundColor: '#333' },
                  '&:disabled': { backgroundColor: '#ccc', color: '#666' },
                  py: 1.5,
                }}
              >
                {isCreatingOrder ? <CircularProgress size={24} color="inherit" /> : 'Order'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckOut;
