import React, { Fragment, useMemo, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { MdAddShoppingCart } from 'react-icons/md';
import { BsFillCartXFill } from 'react-icons/bs';
import '../CartPanel/style.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import useStore from '../../store/useStore';
import ChooseSizeList from '../ChooseSizeList';
import ChooseQuantity from '../ChooseQuantity';
import { useUpdateCartByUserID } from '../../services/cartServices';

const CartPanel = () => {
  // Lấy các trạng thái và hàm từ Zustand store
  const cartItems = useStore((state) => state.cartItems);
  const setCartItems = useStore((state) => state.setCartItems);
  const updateItemSize = useStore((state) => state.updateItemSize);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);
  const userInfo = useStore((state) => state.userInfo);
  const navigate = useNavigate();
  //Call API Update Cart By User ID
  const userId = useStore((state) => state.userInfo?._id);
  const { mutate: updateCart } = useUpdateCartByUserID();

  // Tính toán tổng giá trị (subtotal, shipping, total)

  // --- Tính Toán Giá Trị ---
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item?.product?.price || 0) * (item.quantity || 0), 0);
  }, [cartItems]);
  const total = subtotal;

  // Hàm định dạng tiền tệ (Ví dụ)
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleQuantityZero = (itemId) => {
    const itemToRemove = cartItems.find((item) => item._id === itemId);
    if (!itemToRemove) return;

    const updatedCartItems = cartItems.filter((item) => item._id !== itemId);
    setCartItems(updatedCartItems);

    // Call updateCartByUserID to update the server with quantity 0 (or remove it)
    updateCart({
      userId: userId,
      productId: itemToRemove.productId,
      size: itemToRemove.size,
      color: itemToRemove.color,
      quantity: 0, // Indicate removal or update
    });
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 border-b border-[#f1f1f1]">
        <h1 className="font-[300] text-[18px]">Shopping Cart ({cartItems?.length})</h1>
        <IoCloseSharp className="text-[20px] cursor-pointer" onClick={() => setOpenCartPanel(false)} />
      </div>
      {/* Phần giỏ hàng */}
      <div className="scroll custom-scrollbar w-full max-h-[70%] overflow-y-scroll overflow-x-hidden py-3 px-4">
        {cartItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <BsFillCartXFill className="text-[100px]" />
            <p className="text-center font-[600] text-[25px] text-black">Your cart is empty</p>
            <Link to="/listing">
              <Button
                className="!bg-black !text-white flex gap-3 !items-center"
                onClick={() => setOpenCartPanel(false)}
              >
                <MdAddShoppingCart className="text-[25px] bg-white rounded-full text-black p-1" />
                <p>Shopping Now</p>
              </Button>
            </Link>
          </div>
        ) : (
          cartItems?.map((item) => (
            <div key={item._id} className="cartItem flex items-center gap-4 mb-4 border-b pb-4">
              {/* Hình ảnh sản phẩm */}
              <div className="img w-[25%]">
                <img
                  className="w-full rounded-md object-cover"
                  src={
                    Array.isArray(item.product.images) && item.product.images.length > 0
                      ? item.product?.images[0]?.url
                      : ''
                  }
                  alt={item?.name}
                />
              </div>

              {/* Thông tin sản phẩm */}
              <div className="info w-[70%] flex flex-col gap-2">
                <div className="flex justify-between">
                  <h4 className="text-black font-semibold text-[16px] leading-tight">
                    <Link to={`/products/${item.product._id}`} className="hover:underline">
                      {item.product?.name || 'Nike Dunk 2025'}
                    </Link>
                  </h4>
                  <p className="text-gray-600 text-[14px]">
                    {item.product.price ? `${formatCurrency(item.product.price)}` : 'Null'}
                  </p>
                </div>

                {/* {console.log('item', item)} */}

                <div className="flex items-center justify-between border border-[#ccc] py-2 px-3 rounded-md">
                  {/* Chọn size */}
                  <div className="text-gray-700 text-[14px] flex items-center gap-2">
                    <span className="font-medium">Size:</span>
                    {item.size ? (
                      <ChooseSizeList
                        sizeDefault={item.size}
                        sizeChoose={item.product.variations}
                        onChange={(selectedVariation) => {
                          // Gọi API để cập nhật size
                          updateCart({
                            userId: userId,
                            productId: item.product?.productId,
                            size: selectedVariation?.size,
                            color: selectedVariation?.color, // Nếu biến thể có thuộc tính color
                            quantity: item?.quantity, // Giữ nguyên số lượng hiện tại
                          });
                          // Cập nhật luôn Zustand
                          updateItemSize(item._id, selectedVariation?.size);
                        }}
                      />
                    ) : (
                      <span className="text-gray-500">Null</span>
                    )}
                  </div>

                  {/* Chọn số lượng */}
                  <div className="text-gray-700 text-[14px] flex items-center gap-2">
                    <span className="font-medium">Quantity:</span>
                    <ChooseQuantity
                      quantity={item?.quantity}
                      onQuantityZero={() => handleQuantityZero(item._id)}
                      onUpdateQuantity={(newQuantity) => {
                        // Cập nhật số lượng trong Zustand
                        const updatedCartItems = cartItems.map((cartItem) =>
                          cartItem._id === item._id ? { ...cartItem, quantity: newQuantity } : cartItem
                        );
                        setCartItems(updatedCartItems);

                        // Gọi API để cập nhật giỏ hàng mới
                        updateCart({
                          userId: userId,
                          productId: item.product?.productId,
                          size: item.size,
                          color: item.color,
                          quantity: newQuantity, // Cập nhật số lượng mới
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Phần tính tiền */}
      <div className="bottomInfo bg-white absolute bottom-0 font-[300] py-3 px-3 w-full border-t border-[#f1f1f1] items-center justify-between">
        <div className="flex">
          <span>Sub: </span>
          <span className="ml-auto">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex">
          <span className="font-medium">Total: </span>
          <span className="ml-auto font-medium">{formatCurrency(total)}</span>
        </div>
        <div className="flex flex-col w-full justify-center mt-4">
          <Button
            className={`w-full !rounded-none !py-3 ${
              cartItems?.length === 0
                ? '!bg-gray-400 !text-white cursor-not-allowed hover:!bg-gray-500'
                : '!bg-black !text-white hover:!bg-gray-900'
            }`}
            onClick={() => {
              setOpenCartPanel(false);
              navigate('/checkout');
            }}
            disabled={cartItems?.length === 0}
          >
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
};

export default CartPanel;
