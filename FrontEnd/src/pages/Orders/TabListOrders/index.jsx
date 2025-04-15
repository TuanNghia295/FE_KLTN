import React, { Fragment, useState, useEffect } from 'react';
import { IoCheckboxOutline, IoReceiptOutline } from 'react-icons/io5';
import { FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const TabListOrders = ({ orders }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const categorizedTabs = [
      {
        icon: <IoCheckboxOutline className="text-blue-500" />,
        name: 'Chờ xử lý',
        statuses: ['Pending', 'Processing'],
        data: Array.isArray(orders) ? orders.filter((order) => ['Pending', 'Processing'].includes(order.status)) : [],
      },
      {
        icon: <FaTruck className="text-yellow-500" />,
        name: 'Đang giao',
        statuses: ['Delivering'],
        data: Array.isArray(orders) ? orders.filter((order) => order.status === 'Delivering') : [],
      },
      {
        icon: <FaCheckCircle className="text-green-500" />,
        name: 'Hoàn thành',
        statuses: ['Completed'],
        data: Array.isArray(orders) ? orders.filter((order) => order.status === 'Completed') : [],
      },
      {
        icon: <FaTimesCircle className="text-red-500" />,
        name: 'Đã hủy',
        statuses: ['Cancelled'],
        data: Array.isArray(orders) ? orders.filter((order) => order.status === 'Cancelled') : [],
      },
    ];
    setTabs(categorizedTabs);
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Chờ xử lý</span>;
      case 'Processing':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Đang xử lý</span>;
      case 'Delivering':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Đang giao</span>;
      case 'Completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Hoàn thành</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getPaymentMethod = (method) => {
    return method === 'Paypal' ? (
      <span className="text-blue-600">PayPal</span>
    ) : (
      <span className="text-green-600">Tiền mặt</span>
    );
  };

  // Tính toán số lượng đơn hàng hiển thị tối đa theo kích thước màn hình
  const getVisibleOrdersCount = () => {
    if (window.innerWidth < 640) return 2; // Mobile: 2 đơn
    if (window.innerWidth < 1024) return 3; // Tablet: 3 đơn
    return 4; // Desktop: 4 đơn
  };

  // Tính chiều cao container scroll dựa trên số lượng đơn hàng hiển thị
  const calculateMaxHeight = () => {
    const visibleCount = getVisibleOrdersCount();
    const cardHeight = window.innerWidth < 640 ? 220 : 180; // Card cao hơn trên mobile
    return `${visibleCount * cardHeight + 32}px`; // Thêm padding
  };

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Tabs - Mobile (horizontal scroll) */}
      <div className="lg:hidden flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg flex items-center space-x-2 text-sm ${
              activeTab === index
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.name}</span>
            <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {tab.data?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tabs - Desktop */}
      <div className="hidden lg:flex justify-center border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 xl:px-6 py-3 mx-1 flex flex-col items-center relative ${
              activeTab === index ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="text-xl mb-1">{tab.icon}</div>
            <div className="flex items-center">
              <span className="text-sm xl:text-base">{tab.name}</span>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {tab.data?.length || 0}
              </span>
            </div>
            {activeTab === index && <div className="absolute bottom-0 w-3/4 h-1 bg-blue-500 rounded-t"></div>}
          </button>
        ))}
      </div>

      {/* Orders list container với scroll */}
      <div
        className="space-y-3 sm:space-y-4 overflow-y-auto pr-1"
        style={{
          maxHeight: calculateMaxHeight(),
          scrollbarWidth: 'thin',
        }}
      >
        {tabs[activeTab]?.data?.length > 0 ? (
          tabs[activeTab].data.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <IoReceiptOutline className="text-gray-400 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="font-medium text-sm sm:text-base">Đơn #{order._id.slice(-6).toUpperCase()}</span>
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
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Order content */}
              <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Customer info */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Thông tin giao hàng</h3>
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
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Thanh toán</h3>
                  <div>
                    <p className="text-sm sm:text-base">{getPaymentMethod(order.payment.method)}</p>
                    {order.payment.transactionId && (
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-1">
                        Mã GD: {order.payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order summary */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Tóm tắt</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tổng tiền:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Số lượng:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {order.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm
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
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1">Không có đơn hàng nào</h3>
            <p className="text-gray-500 text-sm sm:text-base">Không tìm thấy đơn hàng nào trong mục này</p>
          </div>
        )}
      </div>
    </div>
  );
};

TabListOrders.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      payment: PropTypes.shape({
        method: PropTypes.oneOf(['Cash', 'Paypal']).isRequired,
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
