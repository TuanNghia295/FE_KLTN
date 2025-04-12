import { useState, useMemo, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Button, CircularProgress, Box, Typography, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaCreditCard, FaRegMoneyBill1 } from 'react-icons/fa6';
import useStore from '../../store/useStore';
// Import các hook từ service vừa tạo
import { useShippingFee, useCreateOrder } from '../../services/paymentServices.jsx';

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A'; // Xử lý giá trị không hợp lệ
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const CheckOut = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  // **QUAN TRỌNG**: Giả định productInfo đã được cập nhật từ ProductDetails
  // Ví dụ: [{ productId: 1, name: 'Nike Air Force', price: 2500000, quantity: 1, size: 'EU 36', color: 'White', imageUrl: '...' }]

  const cartItems = useStore((state) => state.cartItems); // Lấy giỏ hàng từ Zustand
  console.log('Cart items:', cartItems); // Log để kiểm tra dữ liệu

  const productItems = cartItems; // Thay thế productItems bằng cartItems

  const userInfo = useStore((state) => state.userInfo);
  console.log('userInfo', userInfo);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash'); // 'cash' hoặc 'bank_transfer' theo backend
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' }); // State cho thông báo
  const [showAddressList, setShowAddressList] = useState(false); // State để hiển thị danh sách địa chỉ
  const [selectedAddress, setSelectedAddress] = useState(userInfo?.address[0] || ''); // State cho địa chỉ được chọn

  const paymentOptions = [
    { value: 'cash', label: 'Payment with cash', icon: <FaRegMoneyBill1 /> }, // Giá trị khớp với backend
    { value: 'bank_transfer', label: 'Payment with Bank Transfer/VNPay', icon: <FaCreditCard /> }, // Giá trị khớp với backend
  ];

  // --- Gọi API Tính Phí Ship ---
  const {
    data: shippingData, // Chứa { totalFee, distance }
    isLoading: isLoadingShippingFee,
    isError: isErrorShippingFee,
    error: shippingError,
    refetch: refetchShippingFee, // Hàm để gọi lại API với địa chỉ mới
  } = useShippingFee(selectedAddress); // Truyền giá trị mặc định nếu address undefined

  // --- Gọi API Tạo Đơn Hàng (Mutation) ---
  const {
    mutate: createOrderMutate, // Hàm để trigger mutation
    isPending: isCreatingOrder, // Trạng thái loading khi tạo đơn hàng
    isSuccess: isOrderSuccess, // Trạng thái thành công
    isError: isOrderError, // Trạng thái lỗi
    error: orderError, // Thông tin lỗi
    reset: resetCreateOrder, // Hàm để reset trạng thái mutation
  } = useCreateOrder();

  // --- Tính Toán Giá Trị ---
  const subtotal = useMemo(() => {
    return productItems.reduce((sum, item) => sum + (item?.product?.price || 0) * (item.quantity || 0), 0);
  }, [productItems]);

  // Phí ship từ API, mặc định là 0 nếu chưa load hoặc lỗi

  const shippingFee = shippingData?.totalFee ?? 0;
  // Khoảng cách (tùy chọn hiển thị)
  const distance = shippingData?.distance ?? 'N/A';

  // Tổng tiền cuối cùng
  const totalAmount = subtotal + shippingFee;

  // --- Xử lý Chọn Phương Thức Thanh Toán ---
  const handlePaymentChange = (value) => {
    setSelectedPaymentMethod(value);
  };

  // --- Xử lý Đặt Hàng ---
  const handlePlaceOrder = () => {
    // Kiểm tra điều kiện cần thiết
    if (!userInfo || !userInfo._id) {
      setNotification({ open: true, message: 'User information is missing. Please log in again.', severity: 'error' });
      return;
    }
    if (productItems.length === 0) {
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

    // Chuẩn bị payload cho API createOrder
    const orderPayload = {
      // userId đã được xử lý ở backend thông qua middleware xác thực (nếu có)
      // hoặc bạn có thể thêm vào đây nếu backend yêu cầu rõ ràng
      // userId: userInfo._id,
      customerName: userInfo.fullName,
      customerPhone: userInfo.phone,
      toAddress: selectedAddress,
      items: productItems.map((item) => ({
        productId: item.productId, // Numeric ID
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        // Backend không cần name, price, imageUrl trong items array
      })),
      paymentMethod: selectedPaymentMethod,
      note: '', // Có thể thêm trường nhập note nếu muốn
      isReturn: false, // Mặc định cho đơn hàng mới
    };

    console.log('Placing order with payload:', orderPayload); // Log để debug
    // Gọi mutation
    createOrderMutate(orderPayload);
  };

  // --- Xử lý sau khi tạo đơn hàng thành công ---
  useEffect(() => {
    if (isOrderSuccess) {
      setNotification({ open: true, message: 'Order placed successfully!', severity: 'success' });
      // Reset trạng thái mutation để tránh hiển thị lại thông báo nếu component re-render
      resetCreateOrder();
      // TODO: Chuyển hướng đến trang cảm ơn hoặc chi tiết đơn hàng sau vài giây
      // Ví dụ: setTimeout(() => navigate('/order-success'), 2000);
      // Hoặc có thể truyền ID đơn hàng trả về từ API: navigate(`/order-confirmation/${orderData.order._id}`)
      setTimeout(() => navigate('/'), 2000); // Ví dụ: về trang chủ sau 2s
    }
  }, [isOrderSuccess, navigate, resetCreateOrder]); // Thêm resetCreateOrder vào dependency array

  // --- Xử lý lỗi khi tạo đơn hàng ---
  useEffect(() => {
    if (isOrderError) {
      setNotification({
        open: true,
        message: `Failed to place order: ${orderError?.message || 'Unknown server error'}`,
        severity: 'error',
      });
      // Reset mutation state nếu muốn cho phép thử lại ngay
      // setTimeout(resetCreateOrder, 3000); // Reset sau 3s
    }
  }, [isOrderError, orderError, resetCreateOrder]); // Thêm resetCreateOrder nếu bạn reset

  // --- Đóng thông báo ---
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
          {' '}
          {/* Thêm gap */}
          {/* --- Cột Bên Trái: Thông tin thanh toán --- */}
          <div className="leftPart xl:w-[65%] order-2 xl:order-1">
            {' '}
            {/* Điều chỉnh width và order */}
            <h2 className="text-[18px] text-black font-[600] mb-3">BILLING DETAILS</h2>
            {/* Hiển thị thông tin User */}
            <form className="w-full my-3 space-y-4">
              {' '}
              {/* Thêm space-y */}
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
                        refetchShippingFee(addr); // Gọi lại useShippingFee với địa chỉ mới
                      }}
                    >
                      {addr}
                    </Button>
                  ))}
                </div>
              )}
            </form>
            <h2 className="text-[18px] text-black font-[600] my-5">PAYMENT METHOD</h2> {/* Thêm margin */}
            <div className="w-full my-3 space-y-2">
              {' '}
              {/* Thêm space-y */}
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
                    type="radio" // Nên dùng radio cho chọn 1
                    name="paymentMethod" // Cần name để nhóm radio buttons
                    checked={selectedPaymentMethod === option.value}
                    onChange={() => handlePaymentChange(option.value)}
                    className="hidden"
                  />
                  <span className="text-xl">{option.icon}</span> {/* Tăng kích thước icon */}
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* --- Cột Bên Phải: Tóm tắt đơn hàng --- */}
          <div className="rightPart w-full xl:w-[35%] order-1 xl:order-2 border border-gray-200 rounded-lg p-5 shadow-sm">
            {' '}
            {/* Thêm style */}
            <h2 className="text-[18px] text-black font-[600] mb-4 border-b pb-2">YOUR ORDER</h2> {/* Thêm style */}
            {/* Danh sách sản phẩm động */}
            <div className="order-items max-h-60 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar">
              {' '}
              {/* Thêm scroll */}
              {productItems.length > 0 ? (
                productItems.map((item, index) => (
                  <div key={index} className="itemCheckout flex items-center gap-3 text-sm">
                    {/* Giả sử có imageUrl trong productItems */}
                    <img
                      className="rounded w-1/3 h-1/3 object-cover border"
                      src={item?.product?.images[0]?.url || ''} // Placeholder nếu không có ảnh
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
            {/* Chi tiết giá */}
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
              {/* Tùy chọn: Hiển thị khoảng cách
              <div className="flex items-center justify-between text-xs text-gray-500">
                <p>Distance</p>
                <p>{isLoadingShippingFee ? 'Calculating...' : distance}</p>
              </div>
              */}
              <div className="flex items-center justify-between my-3 border-t border-gray-200 pt-3">
                <h4 className="font-bold text-lg text-black">Total</h4>
                <h4 className={`font-bold text-lg ${isErrorShippingFee ? 'text-red-500' : 'text-black'}`}>
                  {/* Chỉ hiển thị tổng nếu phí ship không lỗi */}
                  {isErrorShippingFee ? 'N/A' : formatCurrency(totalAmount)}
                </h4>
              </div>
            </div>
            {/* Nút Đặt Hàng */}
            <div className="w-full mt-5">
              {!userInfo?.address?.[0] && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  Please update your shipping address to place an order.
                </Typography>
              )}
              <Button
                fullWidth // Chiếm toàn bộ width
                variant="contained"
                color="primary" // Màu chủ đạo
                size="large" // Kích thước lớn
                onClick={handlePlaceOrder}
                disabled={
                  isCreatingOrder || isErrorShippingFee || productItems.length === 0 || !userInfo?.address?.[0] // Disable nếu không có địa chỉ
                } // Vô hiệu hóa khi đang tạo hoặc lỗi ship hoặc không có sp hoặc không có địa chỉ
                sx={{
                  backgroundColor: 'black', // Màu nền đen
                  color: 'white', // Chữ trắng
                  '&:hover': { backgroundColor: '#333' }, // Hover tối hơn chút
                  '&:disabled': { backgroundColor: '#ccc', color: '#666' }, // Style khi disabled
                  py: 1.5, // Padding dọc
                }}
              >
                {isCreatingOrder ? <CircularProgress size={24} color="inherit" /> : 'Order'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Component Thông Báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000} // Thời gian hiển thị
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Vị trí
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckOut;
