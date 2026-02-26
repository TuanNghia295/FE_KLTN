import { useEffect, useState } from 'react';
import { CiViewList } from 'react-icons/ci';
import { FaMapLocationDot } from 'react-icons/fa6';
import { PiMoneyWavyLight } from 'react-icons/pi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCancellationReasons, parseCancelOrderError, useOrder } from '../../services/orderServices';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material';
import useStore from '../../store/useStore';
import { formatCash } from '../../hook/formatCash';
import { useGetBankAccountInfos } from '../../services/bankAccountInfoServices';

const OrderDetails = () => {
  // lấy orderId từ url
  const { id } = useParams();

  const {
    getOrderDetail,
    orderDetail,
    isLoadingDetail,
    isError,
    error,
    cancelOrderMutationAsync,
    isCancellingOrder,
  } = useOrder();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedCancellationReasonId, setSelectedCancellationReasonId] = useState('');
  const [cancellationNote, setCancellationNote] = useState('');
  const [cancelValidationError, setCancelValidationError] = useState('');
  const navigate = useNavigate();
  const userInfo = useStore((state) => state.userInfo);
  const { data: bankAccountInfo } = useGetBankAccountInfos();
  const { data: cancellationReasons = [], isLoading: isLoadingCancellationReasons } = useCancellationReasons();

  useEffect(() => {
    if (id) {
      getOrderDetail(id);
    }
  }, [id, getOrderDetail]);

  const resetCancelForm = () => {
    setSelectedCancellationReasonId('');
    setCancellationNote('');
    setCancelValidationError('');
  };

  const closeCancelDialog = () => {
    setIsCancelModalOpen(false);
    resetCancelForm();
  };

  if (isLoadingDetail) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || 'Failed to fetch order details'}</div>;
  }

  if (!orderDetail) {
    return <div>No order details found.</div>;
  }

  const bankAccounts = Array.isArray(bankAccountInfo?.data)
    ? bankAccountInfo.data
    : Array.isArray(bankAccountInfo)
      ? bankAccountInfo
      : [];

  const primaryBankAccount = bankAccounts[0];
  const hasCompleteBankAccount =
    !!primaryBankAccount?.holder_name && !!primaryBankAccount?.bank_account_num && !!primaryBankAccount?.bank_name;
  const isPendingOrder = String(orderDetail?.status || '')?.toLowerCase() === 'pending';
  const hasPendingCancelRequest = Boolean(orderDetail?.cancelRequest);

  const handleCancelOrder = async () => {
    if (!selectedCancellationReasonId) {
      setCancelValidationError('Please select a cancellation reason.');
      return;
    }

    if (!userInfo || !hasCompleteBankAccount) {
      setShowBankModal(true);
      return;
    }

    try {
      await cancelOrderMutationAsync({
        id: orderDetail.id || orderDetail._id,
        payload: {
          cancellation_reason_id: Number(selectedCancellationReasonId),
          ...(cancellationNote?.trim() ? { cancellation_note: cancellationNote.trim() } : {}),
        },
      });
      closeCancelDialog();
    } catch (cancelError) {
      const parsedError = parseCancelOrderError(cancelError);

      if (parsedError.code === 'bank_account_required_for_refund') {
        setShowBankModal(true);
        toast.error(parsedError.message || 'Please update bank account information before requesting a refund.', {
          position: 'top-center',
          autoClose: 3000,
        });
        return;
      }

      if (parsedError.code === 'invalid_cancellation_reason') {
        setCancelValidationError(parsedError.message || 'Please select a valid cancellation reason.');
        return;
      }

      if (parsedError.code === 'invalid_status') {
        toast.error(parsedError.message || 'Order status changed and cannot be cancelled.', {
          position: 'top-center',
          autoClose: 3000,
        });
        if (id) getOrderDetail(id);
        return;
      }

      toast.error(parsedError.message || 'Failed to cancel order', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  const formattedTotalPrice = formatCash(orderDetail?.totalPrice);
  const shippingFee = formatCash(orderDetail.shippingAddress.shippingFee);
  const distance = orderDetail.shippingAddress.distance
    ? `${orderDetail.shippingAddress.distance.toFixed(2)} km`
    : 'N/A';
  const subtotal = orderDetail.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const formattedSubtotal = formatCash(subtotal);

  return (
    <div>
      <section className="container mx-auto py-10 px-4 lg:px-8">
        <section className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="text-[44px] text-red-500">
                <CiViewList />
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Code</p>
                <p className="text-lg font-bold text-gray-900">{orderDetail.order_code || orderDetail._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status</span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                {orderDetail.status}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Created:</span> {new Date(orderDetail.createdAt).toLocaleDateString()}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <FaMapLocationDot className="text-[28px] text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Full Name:</span> {orderDetail.shippingAddress.fullName}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {orderDetail.shippingAddress.phone}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {orderDetail.shippingAddress.address}
              </p>
              <p>
                <span className="font-semibold">Distance:</span> {distance}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <PiMoneyWavyLight className="text-[28px] text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Payment Information</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Method:</span> {orderDetail.payment.method || 'N/A'}
              </p>
              <p>
                <span className="font-semibold">Status:</span>
                {orderDetail.payment.status === 'succeeded' ? (
                  <span className="mx-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-600">
                    {orderDetail.payment.status || 'N/A'}
                  </span>
                ) : (
                  <span className="mx-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-600">
                    {orderDetail.payment.status || 'N/A'}
                  </span>
                )}
              </p>
              <p>
                <span className="font-semibold">Transaction ID:</span> {orderDetail.payment.transactionId || 'N/A'}
              </p>
            </div>
          </section>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
          <div className="space-y-4">
            {orderDetail.items.map((item, index) => (
              <div
                key={item._id || `${item.productId || item.name || 'item'}-${index}`}
                className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="w-full md:w-32 flex-shrink-0">
                  <img
                    className="rounded-lg object-cover w-full h-32"
                    src={item.images?.[0]?.url || '/placeholder-image.png'}
                    alt={item.productName || item.name || 'Product Image'}
                  />
                </div>
                <div className="flex-1 space-y-1 text-sm text-gray-700">
                  <p className="text-base font-semibold text-gray-900">{item.productName || item.name}</p>
                  <p>
                    <span className="font-semibold">Size:</span> {item.size || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Color:</span> {item.color || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Quantity:</span> {item.quantity}
                  </p>
                </div>
                <div className="text-sm text-gray-700 space-y-1 md:text-right">
                  <p>
                    <span className="font-semibold">Unit Price:</span> {formatCash(item.price) || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Line Total:</span>{' '}
                    {formatCash(Number(item.price || 0) * Number(item.quantity || 0)) || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Totals</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{shippingFee}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formattedTotalPrice}</span>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mt-6">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
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
                    isPendingOrder && !hasPendingCancelRequest
                      ? 'border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200 focus:ring-2 focus:ring-red-300'
                      : hasPendingCancelRequest
                        ? 'border-yellow-500 text-yellow-700 bg-yellow-50 cursor-not-allowed'
                        : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                  }
                `}
                disabled={!isPendingOrder || hasPendingCancelRequest}
                onClick={() => {
                  setCancelValidationError('');
                  setIsCancelModalOpen(true);
                }}
                style={{ transition: 'all 0.2s', fontWeight: 500 }}
              >
                {hasPendingCancelRequest ? <>Processing cancellation...</> : 'Cancel Order'}
              </button>
            )}
          </div>
        </section>
      </section>

      <Dialog
        open={isCancelModalOpen}
        onClose={closeCancelDialog}
        aria-labelledby="cancel-order-dialog-title"
        aria-describedby="cancel-order-dialog-description"
      >
        <DialogTitle id="cancel-order-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent sx={{ minWidth: { xs: 300, sm: 420 } }}>
          <DialogContentText id="cancel-order-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to cancel this order?
          </DialogContentText>

          <FormControl fullWidth error={!!cancelValidationError} sx={{ mb: 2 }}>
            <InputLabel id="cancellation-reason-label">Cancellation reason</InputLabel>
            <Select
              labelId="cancellation-reason-label"
              value={selectedCancellationReasonId}
              label="Cancellation reason"
              onChange={(event) => {
                setSelectedCancellationReasonId(event.target.value);
                setCancelValidationError('');
              }}
              disabled={isLoadingCancellationReasons || isCancellingOrder}
            >
              {cancellationReasons.map((reason) => (
                <MenuItem key={reason.id} value={String(reason.id)}>
                  {reason.title}
                </MenuItem>
              ))}
            </Select>
            {!!cancelValidationError && <FormHelperText>{cancelValidationError}</FormHelperText>}
          </FormControl>

          <TextField
            label="Note (optional)"
            fullWidth
            multiline
            minRows={3}
            value={cancellationNote}
            onChange={(event) => setCancellationNote(event.target.value)}
            disabled={isCancellingOrder}
            placeholder="Add more details for your cancellation request"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} color="primary" disabled={isCancellingOrder}>
            Cancel
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="secondary"
            autoFocus
            disabled={isCancellingOrder || isLoadingCancellationReasons}
          >
            {isCancellingOrder ? 'Submitting...' : 'Ok'}
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
