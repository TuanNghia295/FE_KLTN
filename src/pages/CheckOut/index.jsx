import { useState, useMemo, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Button, CircularProgress, Box, Typography, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaPaypal } from 'react-icons/fa6'; // Add FaPaypal import
import useStore from '../../store/useStore';
import { useCreateOrder, useShippingFee } from '../../services/paymentServices.jsx';
import { useClearCart } from '../../services/cartServices.jsx';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import { useGetUserInfo } from '../../services/userServices.jsx';
import { useGetAddresses } from '../../services/addressServices.jsx';

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const paymentOptions = [
  { value: 'cod', label: 'Payment with cash', icon: <FaCreditCard /> },
  { value: 'stripe', label: 'Payment with Stripe', icon: <FaPaypal /> },
];

const CheckOut = () => {
  const navigate = useNavigate();
  const cartItems = useStore((state) => (state.cartSource === 'user' ? state.cartItems : state.guestCartItems));
  const cartSource = useStore((state) => state.cartSource);
  const hydrated = useStore((state) => state.hydrated);
  const hasToken = !!localStorage.getItem('accesstoken');
  const { data: userInfo } = useGetUserInfo();
  const { data: addressesResponse, isLoading: isLoadingAddresses } = useGetAddresses();
  const loadingCart = useStore((state) => state.loadingCart);
  const clearCart = useStore((state) => state.clearCart);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    const parts = [address.street_address, address.ward, address.district, address.city, address.country]
      .map((part) => part?.toString().trim())
      .filter(Boolean);
    return parts.join(', ');
  };

  const addresses = useMemo(() => addressesResponse?.addresses || addressesResponse || [], [addressesResponse]);
  const defaultAddress = addresses.find((address) => address.is_default) || null;
  const effectiveAddress = selectedAddress || defaultAddress || addresses[0] || null;
  const selectedAddressLabel = effectiveAddress ? formatAddress(effectiveAddress) : '';
  const addressLat = effectiveAddress?.lat ?? null;
  const addressLng = effectiveAddress?.lng ?? null;
  const hasAddressCoordinates = addressLat != null && addressLng != null;

  const [derivedCoords, setDerivedCoords] = useState({ lat: null, lng: null, loading: false, error: null });
  const lat = hasAddressCoordinates ? addressLat : derivedCoords.lat;
  const lng = hasAddressCoordinates ? addressLng : derivedCoords.lng;
  const hasCoordinates = lat != null && lng != null;

  const { clearingCartFn } = useClearCart({ userId: userInfo?.id });

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item?.product?.price || 0) * (item.quantity || 0), 0);
  }, [cartItems]);

  const totalItemQty = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);
  const isProductCountZero = totalItemQty === 0;

  const {
    data: shippingData,
    isLoading: isLoadingShippingFee,
    isError: isErrorShippingFee,
    error: shippingError,
    refetch: refetchShippingFee,
  } = useShippingFee({ lat, lng, total_item_qty: totalItemQty });

  const {
    mutate: createOrderMutate,
    isPending: isProcessingOrder,
    isSuccess: isOrderCreationSuccess,
    isError: isOrderCreationError,
    error: orderCreationError,
    reset: resetCreateOrder,
    data: orderResponseData,
  } = useCreateOrder();

  const shippingFee = shippingData?.total_fee ?? 0;
  const distance = shippingData?.distance_km ?? '';
  const totalAmount = subtotal + shippingFee;
  const isCartLoading = loadingCart && cartSource === 'user';

  useEffect(() => {
    if (!hydrated) return;

    if (!hasToken && cartSource === 'guest') {
      sessionStorage.setItem('returnTo', '/checkout');
      navigate('/login');
      return;
    }

    if (userInfo && !isLoadingAddresses && addresses.length === 0) {
      setShowAddressModal(true);
    } else {
      setShowAddressModal(false);
    }
  }, [userInfo, cartSource, navigate, addresses.length, hydrated, hasToken, isLoadingAddresses]);

  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, selectedAddress]);

  useEffect(() => {
    if (!selectedAddressLabel || hasAddressCoordinates) {
      setDerivedCoords({ lat: null, lng: null, loading: false, error: null });
      return;
    }

    let canceled = false;
    const controller = new AbortController();

    const fetchCoordinates = async () => {
      setDerivedCoords((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const encodedAddress = encodeURIComponent(selectedAddressLabel);
        const response = await fetch(
          `https://rsapi.goong.io/geocode?address=${encodedAddress}&api_key=VPm5NokrnVUxZcWC3tWKf6ImVSweqe3pPyq47U5S`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch address coordinates.');
        }
        const data = await response.json();
        const location = data?.results?.[0]?.geometry?.location;
        if (!location || location.lat == null || location.lng == null) {
          throw new Error('No coordinates found for the selected address.');
        }
        if (!canceled) {
          setDerivedCoords({ lat: location.lat, lng: location.lng, loading: false, error: null });
        }
      } catch (error) {
        if (canceled || error?.name === 'AbortError') return;
        setDerivedCoords({
          lat: null,
          lng: null,
          loading: false,
          error: error?.message || 'Failed to fetch coordinates.',
        });
      }
    };

    fetchCoordinates();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [selectedAddressLabel, hasAddressCoordinates]);

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    navigate('/my-address');
  };

  const handlePaymentChange = (value) => {
    setSelectedPaymentMethod(value);
  };

  const handlePlaceOrder = () => {
    // if (!userInfo || !userInfo.id) {
    //   setNotification({ open: true, message: 'User information is missing. Please log in again.', severity: 'error' });
    //   return;
    // }
    // if (cartItems.length === 0) {
    //   setNotification({ open: true, message: 'No products in the order.', severity: 'error' });
    //   return;
    // }
    // if (isErrorShippingFee) {
    //   setNotification({
    //     open: true,
    //     message: `Cannot place order due to shipping calculation error: ${shippingError?.message || 'Unknown error'}`,
    //     severity: 'error',
    //   });
    //   return;
    // }
    // if (!selectedPaymentMethod) {
    //   setNotification({ open: true, message: 'Please select a payment method.', severity: 'warning' });
    //   return;
    // }
    // if (!selectedAddress) {
    //   setNotification({ open: true, message: 'Please select a saved shipping address.', severity: 'error' });
    //   return;
    // }
    // if (!hasCoordinates) {
    //   setNotification({
    //     open: true,
    //     message: derivedCoords.loading
    //       ? 'Fetching address coordinates. Please wait a moment.'
    //       : derivedCoords.error
    //         ? derivedCoords.error
    //         : 'Selected address is missing coordinates. Please update or choose another address.',
    //     severity: 'error',
    //   });
    //   return;
    // }

    const payload = {
      shipping_address: selectedAddressLabel,
      payment_method: selectedPaymentMethod,
      lat: '22.1249703',
      lng: '106.6586052',
      total_item_qty: totalItemQty,
    };

    createOrderMutate(payload);
  };

  useEffect(() => {
    if (isOrderCreationSuccess && orderResponseData) {
      const paymentUrl = orderResponseData?.data?.payment?.paymentUrl;
      const successMessage = orderResponseData?.message || 'Order placed successfully!';

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setNotification({
          open: true,
          message: successMessage,
          severity: 'success',
        });
        if (selectedPaymentMethod === 'cod') {
          clearingCartFn();
          clearCart();
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      }
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

  useEffect(() => {
    if (isOrderCreationError) {
      const unavailableItems = orderCreationError?.unavailable_items;
      const unavailableMessage = Array.isArray(unavailableItems)
        ? unavailableItems
            .map((item) => item?.message || item?.name || '')
            .filter(Boolean)
            .join(', ')
        : null;

      setNotification({
        open: true,
        message: `Failed to process order: ${
          unavailableMessage ||
          orderCreationError?.message ||
          orderCreationError?.details?.join(', ') ||
          orderCreationError?.error ||
          'Unknown server error'
        }`,
        severity: 'error',
      });
      resetCreateOrder();
    }
  }, [isOrderCreationError, orderCreationError, resetCreateOrder]);

  const handleCloseNotification = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      {showAddressModal && (
        <Dialog open={showAddressModal} onClose={handleCloseAddressModal}>
          <DialogTitle>Update Address</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You currently have no valid address. Please update your address to continue.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddressModal} variant="contained" color="primary">
              Update Address
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <section className="section bg-white p-5 relative">
        <div className="container flex flex-col xl:flex-row w-full gap-8 xl:gap-5">
          <div className="leftPart xl:w-[65%] order-2 xl:order-1">
            {/* Billing Details */}
            <h2 className="text-[18px] text-black font-[600] mb-3">BILLING DETAILS</h2>
            <form className="w-full my-3 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo?.full_name || ''}
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
                  value={selectedAddressLabel}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  required
                  InputProps={{ readOnly: true }}
                  error={!selectedAddressLabel || (selectedAddressLabel && !hasCoordinates)}
                  helperText={
                    !selectedAddressLabel
                      ? 'Please select a saved address.'
                      : derivedCoords.loading
                        ? 'Fetching address coordinates...'
                        : derivedCoords.error
                          ? derivedCoords.error
                          : !hasCoordinates
                            ? 'Selected address is missing coordinates.'
                            : ''
                  }
                />
                {addresses.length > 0 && (
                  <Button variant="text" color="primary" onClick={() => setShowAddressList(!showAddressList)}>
                    {showAddressList ? 'Hide' : 'Change'}
                  </Button>
                )}
              </div>
              {showAddressList && addresses.length > 0 && (
                <div className="address-list mt-3 border p-3 rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Select a saved address:
                  </Typography>
                  {addresses.map((addr, index) => {
                    const formattedAddress = formatAddress(addr);
                    return (
                      <Button
                        key={addr.id || index}
                        fullWidth
                        variant={selectedAddress?.id === addr.id ? 'contained' : 'outlined'}
                        sx={{ mb: 1, textAlign: 'left', textTransform: 'none', justifyContent: 'flex-start' }}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressList(false);
                          refetchShippingFee();
                        }}
                      >
                        {formattedAddress}
                      </Button>
                    );
                  })}
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
              {isCartLoading ? (
                <Box className="flex items-center justify-center py-8">
                  <CircularProgress size={24} />
                </Box>
              ) : cartItems.length > 0 ? (
                cartItems.map((item, index) => {
                  const selectedVariation = item.product?.variations?.find(
                    (variation) => variation.id === item.product_variant_id
                  );
                  const displaySize = item.size ?? selectedVariation?.size;
                  const displayColor = item.color ?? selectedVariation?.color;

                  return (
                    <div key={item._id || index} className="itemCheckout flex items-center gap-3 text-sm">
                      {' '}
                      {/* Use item._id if available */}
                      <img
                        className="rounded w-16 h-16 object-cover border" // Kích thước cố định hơn
                        src={item?.product?.images[0]?.url || null} // Thêm ảnh placeholder
                        alt={item?.name || 'Product Image'}
                        onError={(e) => (e.target.src = '/placeholder-image.png')} // Xử lý lỗi ảnh
                      />
                      <div className="info flex-grow min-w-0">
                        {' '}
                        {/* Thêm min-w-0 */}
                        <Tooltip title={item.product?.name || 'N/A'} placement="top">
                          <h4 className="font-medium text-black truncate">{item.product?.name || 'N/A'}</h4>{' '}
                          {/* Sử dụng truncate */}
                        </Tooltip>
                        <p className="text-gray-500 text-xs">Size: {displaySize}</p>
                        <p className="text-gray-500 text-xs">Color: {displayColor}</p> {/* Hiển thị màu */}
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="ml-auto font-medium text-black text-right whitespace-nowrap">
                        {' '}
                        {/* Thêm text-right và whitespace-nowrap */}
                        {formatCurrency(item?.product?.price * item.quantity)}
                      </div>
                    </div>
                  );
                })
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
              {isCartLoading ? (
                <Box className="flex items-center justify-center py-4">
                  <CircularProgress size={20} />
                </Box>
              ) : (
                <>
                  <div
                    className={`flex items-center justify-between text-sm ${isProductCountZero ? 'opacity-50' : ''}`}
                  >
                    <p className="text-gray-600">Products ({totalItemQty})</p>
                    <p className="text-gray-800 font-medium">{formatCurrency(subtotal)}</p>
                  </div>
                  {isProductCountZero && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      No products selected. Please add at least 1 product to continue checkout.
                    </Typography>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <Tooltip title={distance ? `Distance: ${distance}` : ''} placement="top">
                      <p className="text-gray-600">Shipping ({distance ?? null})</p>
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
                </>
              )}
            </div>

            {/* Order Button */}
            <div className="w-full mt-5">
              {/* Thông báo nếu chưa có địa chỉ */}
              {(!selectedAddress || (!hasCoordinates && !derivedCoords.loading)) && (
                <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
                  {!selectedAddress
                    ? 'Please select a saved shipping address.'
                    : 'Selected address is missing coordinates.'}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                // Disable khi đang xử lý, lỗi phí ship, giỏ hàng rỗng, hoặc chưa có địa chỉ
                // disabled={
                //   isProcessingOrder ||
                //   isErrorShippingFee ||
                //   cartItems.length === 0 ||
                //   !selectedAddress ||
                //   !hasCoordinates ||
                //   derivedCoords.loading
                // }
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
                selectedPaymentMethod === 'stripe' ? (
                  'Proceed to Stripe'
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
