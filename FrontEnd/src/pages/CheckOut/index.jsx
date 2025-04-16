import { useState, useMemo, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Button, CircularProgress, Box, Typography, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaRegMoneyBill1, FaPaypal } from 'react-icons/fa6'; // Thêm FaPaypal
import useStore from '../../store/useStore';
import { useShippingFee, useCreateOrder } from '../../services/paymentServices.jsx'; // Chỉ cần useCreateOrder
import { useClearCart } from '../../services/cartServices.jsx';

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

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(userInfo?.address[0] || '');
  const { clearingCartFn } = useClearCart({ userId: userInfo?._id });

  // Cập nhật paymentOptions với Paypal
  const paymentOptions = [
    { value: 'Cash', label: 'Payment with cash', icon: <FaRegMoneyBill1 /> },
    // { value: 'BankTransfer', label: 'Payment with Bank Transfer', icon: <FaCreditCard /> }, // Bỏ BankTransfer nếu chỉ dùng Paypal
    { value: 'Paypal', label: 'Payment with Paypal', icon: <FaPaypal /> }, // Sử dụng icon Paypal
  ];

  const {
    data: shippingData,
    isLoading: isLoadingShippingFee,
    isError: isErrorShippingFee,
    error: shippingError,
    refetch: refetchShippingFee,
  } = useShippingFee(selectedAddress);

  const {
    mutate: createOrderMutate,
    isPending: isProcessingOrder, // Đổi tên để rõ ràng hơn (bao gồm cả tạo order và gọi PayPal)
    isSuccess: isOrderCreationSuccess, // Chỉ đánh dấu thành công của việc gọi API createOrder
    isError: isOrderCreationError, // Chỉ đánh dấu lỗi của việc gọi API createOrder
    error: orderCreationError,
    reset: resetCreateOrder,
    data: orderResponseData, // Dữ liệu trả về (có thể chứa paymentUrl)
  } = useCreateOrder();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item?.product?.price || 0) * (item.quantity || 0), 0);
  }, [cartItems]);

  const shippingFee = shippingData?.totalFee ?? 0;
  const distance = shippingData?.distance ?? 'N/A';
  const totalAmount = subtotal + shippingFee;

  const handlePaymentChange = (value) => {
    setSelectedPaymentMethod(value);
  };

  const handlePlaceOrder = () => {
    // --- Kiểm tra điều kiện ---
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
    if (!selectedAddress) {
      // Kiểm tra selectedAddress thay vì userInfo.address[0]
      setNotification({ open: true, message: 'Please select or provide a shipping address.', severity: 'error' });
      return;
    }

    // --- Chuẩn bị payload ---
    const payload = {
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
      isReturn: false,
    };

    console.log('Calling createOrder API with payload:', payload);
    // Gọi API createOrder cho mọi trường hợp (backend sẽ xử lý)
    createOrderMutate(payload);
  };

  // --- Xử lý sau khi gọi API createOrder thành công ---
  useEffect(() => {
    if (isOrderCreationSuccess && orderResponseData) {
      console.log('API createOrder response:', orderResponseData);
      if (orderResponseData.paymentUrl) {
        // Nếu có paymentUrl (trường hợp PayPal), chuyển hướng người dùng
        console.log('Redirecting to PayPal:', orderResponseData.paymentUrl);
        window.location.href = orderResponseData.paymentUrl;
        // Không cần reset hay làm gì khác ở đây, chờ callback từ PayPal
      } else {
        // Nếu không có paymentUrl (trường hợp Cash)
        setNotification({
          open: true,
          message: orderResponseData.message || 'Order placed successfully!',
          severity: 'success',
        });
        // Chỉ xóa giỏ hàng và điều hướng khi là thanh toán Cash thành công
        if (selectedPaymentMethod === 'Cash') {
          clearingCartFn(); // Gọi API xóa giỏ hàng trên server
          clearCart(); // Xóa giỏ hàng trên client (Zustand)
          setTimeout(() => {
            navigate('/'); // Chuyển hướng về trang chủ
          }, 1500); // Tăng thời gian chờ một chút
        }
      }
      // Reset mutation state sau khi đã xử lý (dù là redirect hay hiển thị thông báo)
      resetCreateOrder();
    }
  }, [
    isOrderCreationSuccess,
    orderResponseData,
    navigate,
    clearCart,
    clearingCartFn,
    resetCreateOrder,
    selectedPaymentMethod,
  ]);

  // --- Xử lý khi gọi API createOrder bị lỗi ---
  useEffect(() => {
    if (isOrderCreationError) {
      console.error('Order creation API error:', orderCreationError);
      setNotification({
        open: true,
        // Hiển thị lỗi chi tiết hơn từ backend nếu có
        message: `Failed to process order: ${
          orderCreationError?.response?.data?.details?.join(', ') ||
          orderCreationError?.message ||
          'Unknown server error'
        }`,
        severity: 'error',
      });
      resetCreateOrder(); // Reset trạng thái mutation
    }
  }, [isOrderCreationError, orderCreationError, resetCreateOrder]);

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
            {/* Billing Details */}
            <h2 className="text-[18px] text-black font-[600] mb-3">BILLING DETAILS</h2>
            <form className="w-full my-3 space-y-4">
              <div className="flex items-center gap-3">
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo?.fullName || ''}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={userInfo?.phone || ''}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </div>
              <div className="flex items-center gap-2">
                <TextField
                  fullWidth
                  label="Address"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)} // Cho phép chỉnh sửa nếu không chọn từ danh sách
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  required // Thêm required
                  error={!selectedAddress} // Hiển thị lỗi nếu rỗng
                  helperText={!selectedAddress ? 'Shipping address is required.' : ''}
                />
                {userInfo?.address &&
                  userInfo.address.length > 0 && ( // Chỉ hiển thị nút Change nếu có địa chỉ lưu
                    <Button variant="text" color="primary" onClick={() => setShowAddressList(!showAddressList)}>
                      {showAddressList ? 'Hide' : 'Change'}
                    </Button>
                  )}
                {/* Thêm nút để thêm địa chỉ mới nếu cần */}
                {/* <Button variant="outlined" size="small">Add New Address</Button> */}
              </div>
              {showAddressList && userInfo?.address && (
                <div className="address-list mt-3 border p-3 rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Select a saved address:
                  </Typography>
                  {userInfo.address.map((addr, index) => (
                    <Button
                      key={index}
                      fullWidth
                      variant={selectedAddress === addr ? 'contained' : 'outlined'} // Highlight địa chỉ đã chọn
                      sx={{ mb: 1, textAlign: 'left', textTransform: 'none', justifyContent: 'flex-start' }}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressList(false); // Tự đóng khi chọn
                        refetchShippingFee(); // Refetch phí ship khi đổi địa chỉ
                      }}
                    >
                      {addr}
                    </Button>
                  ))}
                </div>
              )}
            </form>

            {/* Payment Method */}
            <h2 className="text-[18px] text-black font-[600] my-5">PAYMENT METHOD</h2>
            <div className="w-full my-3 space-y-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex items-center p-3 border rounded-md gap-4 cursor-pointer transition ${
                    selectedPaymentMethod === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-300 font-semibold' // Thêm ring
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    id={option.value}
                    type="radio"
                    name="paymentMethod"
                    value={option.value} // Thêm value
                    checked={selectedPaymentMethod === option.value}
                    onChange={() => handlePaymentChange(option.value)}
                    className="hidden" // Giữ ẩn radio button gốc
                  />
                  {/* Sử dụng Box để tạo radio button tùy chỉnh */}
                  <Box
                    component="span"
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${selectedPaymentMethod === option.value ? '#2563EB' : '#D1D5DB'}`, // Tailwind blue-600 and gray-300
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1, // Thêm margin
                    }}
                  >
                    {selectedPaymentMethod === option.value && (
                      <Box
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#2563EB', // Tailwind blue-600
                        }}
                      />
                    )}
                  </Box>
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rightPart w-full xl:w-[35%] order-1 xl:order-2 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col">
            {/* Your Order */}
            <h2 className="text-[18px] text-black font-[600] mb-4 border-b pb-2">YOUR ORDER</h2>
            <div className="order-items flex-grow max-h-60 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={item._id || index} className="itemCheckout flex items-center gap-3 text-sm">
                    {' '}
                    {/* Use item._id if available */}
                    <img
                      className="rounded w-16 h-16 object-cover border" // Kích thước cố định hơn
                      src={item?.product?.images[0]?.url || '/placeholder-image.png'} // Thêm ảnh placeholder
                      alt={item.name || 'Product Image'}
                      onError={(e) => (e.target.src = '/placeholder-image.png')} // Xử lý lỗi ảnh
                    />
                    <div className="info flex-grow min-w-0">
                      {' '}
                      {/* Thêm min-w-0 */}
                      <Tooltip title={item.product?.name || 'N/A'} placement="top">
                        <h4 className="font-medium text-black truncate">{item.product?.name || 'N/A'}</h4>{' '}
                        {/* Sử dụng truncate */}
                      </Tooltip>
                      <p className="text-gray-500 text-xs">Size: {item.size}</p>
                      <p className="text-gray-500 text-xs">Color: {item.color}</p> {/* Hiển thị màu */}
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="ml-auto font-medium text-black text-right whitespace-nowrap">
                      {' '}
                      {/* Thêm text-right và whitespace-nowrap */}
                      {formatCurrency(item?.product?.price * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                  Your cart is empty.
                </Typography>
              )}
            </div>

            {/* Price Details */}
            <div className="price-details space-y-2 border-t pt-4 mt-auto">
              {' '}
              {/* Thêm mt-auto */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-800 font-medium">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Tooltip title={distance ? `Distance: ${distance}` : ''} placement="top">
                  <p className="text-gray-600">Shipping</p>
                </Tooltip>
                {isLoadingShippingFee ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isErrorShippingFee ? (
                  <Tooltip title={shippingError?.message || 'Error calculating shipping'} placement="top">
                    <span className="text-red-500 cursor-help font-medium">Error</span>
                  </Tooltip>
                ) : (
                  <p className="text-gray-800 font-medium">{formatCurrency(shippingFee)}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-lg my-3 border-t border-gray-200 pt-3 font-bold text-black">
                <h4>Total</h4>
                <h4 className={`${isErrorShippingFee ? 'text-red-500' : ''}`}>
                  {isErrorShippingFee ? 'N/A' : formatCurrency(totalAmount)}
                </h4>
              </div>
            </div>

            {/* Order Button */}
            <div className="w-full mt-5">
              {/* Thông báo nếu chưa có địa chỉ */}
              {!selectedAddress && (
                <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
                  Please select or enter a shipping address.
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                // Disable khi đang xử lý, lỗi phí ship, giỏ hàng rỗng, hoặc chưa có địa chỉ
                disabled={isProcessingOrder || isErrorShippingFee || cartItems.length === 0 || !selectedAddress}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': { backgroundColor: '#333' },
                  '&:disabled': { backgroundColor: '#ccc', color: '#666' },
                  py: 1.5, // Tăng padding
                  fontSize: '1rem', // Tăng cỡ chữ
                  fontWeight: '600',
                }}
              >
                {isProcessingOrder ? (
                  <CircularProgress size={24} color="inherit" />
                ) : // Thay đổi text tùy theo phương thức thanh toán
                selectedPaymentMethod === 'Paypal' ? (
                  'Proceed to Paypal'
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Component Thông Báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000} // Tăng thời gian hiển thị
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Thêm thuộc tính variant="filled" để có nền màu */}
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckOut;
