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
import { useUpdateCartItem } from '../../services/cartServices';

const CartPanel = () => {
  // Lấy các trạng thái và hàm từ Zustand store
  const cartSource = useStore((state) => state.cartSource);
  const cartItems = useStore((state) => (state.cartSource === 'user' ? state.cartItems : state.guestCartItems));
  const setCartItems = useStore((state) => state.setCartItems);
  const setGuestCartItems = useStore((state) => state.setGuestCartItems);
  const updateItemSize = useStore((state) => state.updateItemSize);
  const updateGuestItemSize = useStore((state) => state.updateGuestItemSize);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);
  const userInfo = useStore((state) => state.userInfo);
  const navigate = useNavigate();
  const { mutate: updateCart } = useUpdateCartItem();

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
    const itemToRemove = cartItems.find((item) => item.id === itemId);
    if (!itemToRemove) return;

    const updatedCartItems = cartItems.filter((item) => item.id !== itemId);

    if (cartSource === 'guest') {
      setGuestCartItems(updatedCartItems);
      return;
    }

    setCartItems(updatedCartItems);

    // Call updateCartByUserID to update the server with quantity 0 (or remove it)
    updateCart({
      cartItemId: itemToRemove.id,
      product_variant_id: itemToRemove.product_variant_id,
      quantity: 0,
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
          cartItems?.map((item) => {
            const selectedVariation = item.product?.variations?.find(
              (variation) => variation.id === item.product_variant_id
            );
            const displaySize = item.size ?? selectedVariation?.size;
            const displayColor = item.color ?? selectedVariation?.color;

            return (
              <div key={item.id} className="cartItem flex items-center gap-4 mb-4 border-b pb-4">
                {/* Hình ảnh sản phẩm */}
                <div className="img w-[25%]">
                  <img
                    className="w-full rounded-md object-cover"
                    src={
                      Array.isArray(item.product?.images) && item.product.images.length > 0
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
                      <Link to={`/products/${item.product.id}`} className="hover:underline">
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
                      {displaySize || item.product_variant_id ? (
                        <ChooseSizeList
                          sizeDefault={displaySize}
                          sizeChoose={item.product.variations}
                          onChange={(selectedVariation) => {
                            // Gọi API để cập nhật size
                            if (cartSource === 'guest') {
                              updateGuestItemSize(item.id, selectedVariation);
                            } else {
                              updateCart({
                                cartItemId: item.id,
                                product_variant_id: selectedVariation?.id,
                                quantity: item?.quantity,
                              });
                              // Cập nhật luôn Zustand
                              updateItemSize(item.id, selectedVariation?.size);
                            }
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
                        onQuantityZero={() => handleQuantityZero(item.id)}
                        onUpdateQuantity={(newQuantity) => {
                          // Cập nhật số lượng trong Zustand
                          const updatedCartItems = cartItems.map((cartItem) =>
                            cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
                          );

                          if (cartSource === 'guest') {
                            setGuestCartItems(updatedCartItems);
                            return;
                          }

                          setCartItems(updatedCartItems);

                          // Gọi API để cập nhật giỏ hàng mới
                          updateCart({
                            cartItemId: item.id,
                            product_variant_id: item.product_variant_id,
                            quantity: newQuantity,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
              if (!userInfo) {
                sessionStorage.setItem('returnTo', '/checkout');
                navigate('/login');
                return;
              }
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
