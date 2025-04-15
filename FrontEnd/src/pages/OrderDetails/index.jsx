import React, { useEffect } from 'react';
import { CiViewList } from 'react-icons/ci';
import { FaMapLocationDot } from 'react-icons/fa6';
import { PiMoneyWavyLight } from 'react-icons/pi';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import OrderStatus from './OrderStatusComponent';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useOrder } from '../../services/orderServices';
import { useProductDetail } from '../../services/productsService';

const OrderDetails = () => {
  // lấy orderId từ url
  const { id } = useParams();

  const { getOrderDetail, orderDetail, isLoadingDetail, isError, error } = useOrder();

  const { productDetail } = useProductDetail(orderDetail?.items[0]?.productVariationId);
  console.log('productDetail', productDetail);

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

  return (
    <section className="container !py-10">
      <section className="statusOrder flex bg-red-500 p-4 items-center rounded-t-lg text-white gap-10">
        <div className="part1 text-[60px]">
          <CiViewList />
        </div>
        <div className="part2 text-[16px]">
          <p className="font-[600]">Order Status: {orderDetail.status}</p>
          <p>Description</p>
        </div>
      </section>
      <section className="statusOrder flex bg-[#fff] p-4 items-center rounded-b-lg text-black gap-10">
        <div className="part1 text-[60px]">
          <FaMapLocationDot />
        </div>
        <div className="part2 text-[16px]">
          <p className="font-[600]">Shipping Address</p>
          <p>Full Name: {orderDetail.shippingAddress.fullName}</p>
          <p>Phone: {orderDetail.shippingAddress.phone}</p>
          <p>Address: {orderDetail.shippingAddress.address}</p>
        </div>
      </section>

      <section className="paymentMethod bg-white my-10 rounded-lg p-4">
        <span className="text-[20px] font-[600] text-black flex items-center gap-4">
          <PiMoneyWavyLight className="text-[30px]" />
          Payment Method
        </span>
        <div className="pt-5">
          <p className="text-[17px]">{orderDetail.payment.method}</p>
        </div>
      </section>

      <section className="bg-white p-4 rounded-lg">
        <OrderStatus status={orderDetail.status} />
        <div className="flex flex-col xl:flex-row">
          <div className="rightPart w-[100%] xl:w-[30%] pl-0 xl:pl-5 font-[300]">
            <div className="flex w-full">
              <h2 className="text-[18px] text-black font-[600]">ORDER ID: {orderDetail._id}</h2>
            </div>

            <div className="w-full my-3">
              <p className="border-t border-b border-[#f1f1f1] py-2  flex">
                Product <span className="ml-auto">Subtotal</span>
              </p>
            </div>

            <div>
              {orderDetail.items.map((item, index) => (
                <div key={index} className="itemCheckout flex items-center mb-3">
                  <div className="border border-[#f1f1f1] rounded-xl w-[60px] h-[60px] relative">
                    <img
                      className="rounded-xl object-center w-[60px] h-[60px]"
                      src={item.productImage || '/placeholder-image.png'}
                      alt={item.productName || 'Product Image'}
                    />
                    <p className="absolute -top-2 -right-2 rounded-full text-white bg-[#5e5e5e] text-center min-w-6 min-h-6">
                      {item.quantity}
                    </p>
                  </div>

                  <div className="info ml-3">
                    <h4 className="font-[500] text-black">{item.productName}</h4>
                    <p>Size: {item.size || 'N/A'}</p>
                  </div>

                  <div className="ml-auto">{item.price}$</div>
                </div>
              ))}
            </div>
          </div>
          <div className="leftPart w-[100%] xl:w-[70%] pl-0 xl:pl-10">
            <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(orderDetail.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">Order placed successfully</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end gap-3 py-4">
              <Link to="/my-orders">
                <button className="bg-black text-white p-3">Return My Order</button>
              </Link>
              <button className="bg-red-500 text-white p-3">Cancel Order</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm khác */}
      <section>
        <h2 className="text-[20px] font-[600] mb-4 pl-8  mt-9">Related Product</h2>
        <HomeCartSlider slidesPerView={slidesPerView} />
      </section>
    </section>
  );
};

export default OrderDetails;
