import { useEffect } from 'react';
import { CiViewList } from 'react-icons/ci';
import { FaMapLocationDot } from 'react-icons/fa6';
import { PiMoneyWavyLight } from 'react-icons/pi';
import { Link, useParams } from 'react-router-dom';
import OrderStatus from './OrderStatusComponent';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useOrder } from '../../services/orderServices';

const OrderDetails = () => {
  // lấy orderId từ url
  const { id } = useParams();

  const { getOrderDetail, orderDetail, isLoadingDetail, isError, error } = useOrder();

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

  const slidesPerView = window.innerWidth > 1024 ? 4 : window.innerWidth > 600 ? 4 : 3;

  return (
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
                <span className="font-bold">Price:</span> {orderDetail.items[0]?.price}$
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
              <button className="border border-red-500 text-red-500 px-6 py-2 rounded-lg shadow-md hover:bg-red-100 transition">
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
  );
};

export default OrderDetails;
