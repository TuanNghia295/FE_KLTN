import React, { Fragment, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import '../CartPanel/style.css';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import useStore from '../../store/useStore';
import ChooseSizeList from '../ChooseSizeList';
import ChooseQuantity from '../ChooseQuantity';
import { useUpdateCartByUserID } from '../../services/cartServices';

const CartPanel = () => {
  // Lấy các trạng thái và hàm từ Zustand store
  const cartItems = useStore((state) => state.cartItems);
  // console.log(cartItems)
  const removeItemFromCart = useStore((state) => state.removeItemFromCart);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);

  //Call API Update Cart By User ID
  const userId = useStore((state) => state.userInfo?._id);
  const {mutate: updateCart} = useUpdateCartByUserID()

  // Tính toán tổng giá trị (subtotal, shipping, total)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 800; // Giả sử shipping cố định là 800$
  const total = subtotal + shipping;

  // Hàm định dạng tiền tệ (Ví dụ)
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 border-b border-[#f1f1f1]">
        <h1 className="font-[300] text-[18px]">Shopping Cart ({cartItems.length})</h1>
        <IoCloseSharp className="text-[20px] cursor-pointer" onClick={() => setOpenCartPanel(false)} />
      </div>

      <div>
        <div className="scroll custom-scrollbar w-full max-h-[660px] overflow-y-scroll overflow-x-hidden py-3 px-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="cartItem w-full flex items-center gap-4 mb-5">
                <div className="img w-[30%]">
                  <img
                    className="w-full"
                    src={
                      Array.isArray(item.product.images) && item.product.images.length > 0
                        ? item.product.images[0].url
                        : ""
                    }
                    alt={item.name}
                  />
                </div>
                <div className="info w-[60%]">
                  <h4 className="text-black font-[500]">
                    <Link to={`/products/${item.product._id}`}>{item.product.name || 'Nike Dunk 2025'}</Link>
                  </h4>
                  <p className="font-[400]">
                    <span>{item.product.price ? `${formatCurrency(item.product.price)}` : 'Null'}</span>
                  </p>
                  <div className="font-[400]">
                    {item.size ? (
                      <Fragment>
                        Size:
                        <ChooseSizeList sizeDefault={item.size} sizeChoose={item.product.variations} onChange={(e) => {
                          // Cập nhật size cho sản phẩm khi người dùng thay đổi
                          const newSize = e.target.value;
                          // Giả sử bạn có một hàm cập nhật trong store để thay đổi size
                          useStore.getState().updateItemSize(item._id, newSize);
                          // Size Update To Backend
                          const data = {
                            userId : userId,
                            productId : item.productId,
                            size : newSize,
                            color : item.color,
                            quantity : 5
                          }
                          console.log(data)
                          updateCart(data)
                        }} />
                      </Fragment>
                    ) : ('Null')}
                  </div>
                  <div className="font-[400]">
                    <span>Quantity: {item.quantity ? `${item.quantity}` : 'Null'}</span>
                    <ChooseQuantity quantity={item.quantity} />
                  </div>
                </div>
                <div className="cursor-pointer">
                  <MdDelete
                    className="text-[30px] text-[#f1f1f1] hover:text-red-300 mr-4"
                    onClick={() => removeItemFromCart(item._id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bottomInfo bg-white absolute bottom-0 font-[300] py-3 px-3 w-full border-t border-[#f1f1f1] items-center justify-between">
          <div className="flex">
            <span>Sub: </span>
            <span className="ml-auto">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex">
            <span>Shipping: </span>
            <span className="ml-auto">{formatCurrency(shipping)}</span>
          </div>
          <div className="flex">
            <span>Total: </span>
            <span className="ml-auto">{formatCurrency(total)}</span>
          </div>
          <div className="flex flex-col w-full justify-center mt-4">
            <Link to="/checkout">
              <Button
                className="w-full !bg-black !rounded-none !text-white !py-3"
                onClick={() => setOpenCartPanel(false)}
              >
                Checkout
              </Button>
            </Link>
            <Link to="/cart">
              <Button
                className="w-full !text-gray-600 !bg-[#f1f1f1] !rounded-none !mt-2 !py-3 hover:!bg-black hover:!text-white"
                onClick={() => setOpenCartPanel(false)}
              >
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPanel;
