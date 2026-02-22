/* eslint-disable react/prop-types */
import { IoCheckboxOutline, IoReceiptOutline } from 'react-icons/io5';
import { FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const TAB_CONFIGS = [
  {
    icon: <IoCheckboxOutline className="text-blue-500" />,
    name: 'Pending',
    statusKey: 'pending',
  },
  {
    icon: <FaTruck className="text-yellow-500" />,
    name: 'Processing',
    statusKey: 'processing',
  },
  {
    icon: <FaCheckCircle className="text-green-500" />,
    name: 'Completed',
    statusKey: 'completed',
  },
  {
    icon: <FaTimesCircle className="text-red-500" />,
    name: 'Cancelled',
    statusKey: 'cancelled',
  },
];

const TabListOrders = ({ orders, meta, activeStatus, onTabChange, currentPage, onPageChange }) => {
  const counts = meta?.counts || {};
  const totalPages = meta?.total_pages || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'Pending':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'processing':
      case 'Processing':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Processing</span>;
      case 'completed':
      case 'Completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getPaymentMethod = (method) => {
    return method === 'stripe' ? (
      <span className="text-blue-600">Stripe</span>
    ) : (
      <span className="text-green-600">Cash</span>
    );
  };

  const getOrderCode = (order) => order.order_code || order._id;
  const formatOrderCode = (order) => {
    const code = getOrderCode(order);
    return typeof code === 'string' ? code.slice(-6).toUpperCase() : '';
  };

  const getPageItems = () => {
    if (totalPages <= 1) return [];
    const maxNumbers = 5;
    const pages = new Set([1, totalPages, currentPage]);

    if (currentPage - 1 > 1) pages.add(currentPage - 1);
    if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    while (sorted.length < Math.min(maxNumbers, totalPages)) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first > 2) {
        sorted.unshift(first - 1);
      } else if (last < totalPages - 1) {
        sorted.push(last + 1);
      } else {
        break;
      }
    }

    const result = [];
    for (let i = 0; i < sorted.length; i += 1) {
      const page = sorted[i];
      const prev = sorted[i - 1];
      if (prev && page - prev > 1) result.push('...');
      result.push(page);
    }
    return result;
  };

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Tabs - Mobile (horizontal scroll) */}
      <div className="lg:hidden flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {TAB_CONFIGS.map((tab) => (
          <button
            key={tab.statusKey}
            onClick={() => onTabChange(tab.name)}
            className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg flex items-center space-x-2 text-sm ${
              activeStatus === tab.name
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.name}</span>
            <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {(tab.statusKey === 'processing' ? counts.processing || counts.shipping : counts[tab.statusKey]) || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tabs - Desktop */}
      <div className="hidden lg:flex justify-center border-b border-gray-200 mb-6">
        {TAB_CONFIGS.map((tab) => (
          <button
            key={tab.statusKey}
            onClick={() => onTabChange(tab.name)}
            className={`px-4 xl:px-6 py-3 mx-1 flex flex-col items-center relative ${
              activeStatus === tab.name ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="text-xl mb-1">{tab.icon}</div>
            <div className="flex items-center">
              <span className="text-sm xl:text-base">{tab.name}</span>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {(tab.statusKey === 'processing' ? counts.processing || counts.shipping : counts[tab.statusKey]) || 0}
              </span>
            </div>
            {activeStatus === tab.name && <div className="absolute bottom-0 w-3/4 h-1 bg-blue-500 rounded-t"></div>}
          </button>
        ))}
      </div>

      {/* Orders list container với scroll */}
      <div
        className="space-y-3 sm:space-y-4 overflow-y-auto pr-1"
        style={{
          scrollbarWidth: 'thin',
          overflowX: 'hidden', // Ensure no horizontal scroll
        }}
      >
        {orders?.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <IoReceiptOutline className="text-gray-400 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="font-medium text-sm sm:text-base">Order #{formatOrderCode(order)}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="mr-2">{getStatusBadge(order.status)}</div>
                  <Link
                    to={`/my-orders/order/${order._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                  >
                    View details
                  </Link>
                </div>
              </div>

              {/* Order content */}
              <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Customer info */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Shipping info</h3>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-600 text-sm">{order.shippingAddress.phone}</p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                      {order.shippingAddress.address}
                    </p>
                  </div>
                </div>

                {/* Payment info */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Payment</h3>
                  <div>
                    <p className="text-sm sm:text-base">{getPaymentMethod(order.payment.method)}</p>
                    {order.payment.transactionId && (
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-1">
                        Transaction ID: {order.payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order summary */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Summary</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Items:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {order.items.reduce((total, item) => total + item.quantity, 0)} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <IoReceiptOutline className="mx-auto text-3xl sm:text-4xl" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1">No orders found</h3>
            <p className="text-gray-500 text-sm sm:text-base">There are no orders in this section.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center mt-4 gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 mx-1 rounded border border-gray-200 text-sm ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Prev
          </button>
          {getPageItems().map((item, index) =>
            item === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`px-3 py-1 mx-1 rounded text-sm ${
                  currentPage === item ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 mx-1 rounded border border-gray-200 text-sm ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

TabListOrders.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      payment: PropTypes.shape({
        method: PropTypes.oneOf(['stripe', 'cod']).isRequired,
        transactionId: PropTypes.string,
        status: PropTypes.string,
      }).isRequired,
      totalPrice: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      shippingAddress: PropTypes.shape({
        fullName: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
      }).isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          productVariationId: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
          quantity: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default TabListOrders;
