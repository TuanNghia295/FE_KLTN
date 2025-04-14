import React, { useState } from 'react'
import "../ProductItemListView/style.css"
import { Link } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';
import { FaRegHeart } from "react-icons/fa"
import { IoGitCompareOutline } from "react-icons/io5"
import { MdZoomOutMap } from "react-icons/md"
import Tooltip from '@mui/material/Tooltip';
import { formatCash } from '../../hook/formatCash';
import useStore from '../../store/useStore';
import { useAddToCart } from '../../services/cartServices';
import { CgPlayTrackNextR } from "react-icons/cg";
import { CgPlayTrackPrevR } from "react-icons/cg";
import { motion, AnimatePresence } from 'framer-motion';


const ProductItemListView = ({ product, normalizeString }) => {
  const userInfo = useStore((state) => state.userInfo);
  const [productId, setProductId] = useState('') // State lưu productID
  const [selectedSize, setSelectedSize] = useState(null); // State lưu size đã chọn
  const [selectedColor, setSelectedColor] = useState(null); // State lưu color đã chọn
  const [startIndex, setStartIndex] = useState(0);

  const data = {
    userId: userInfo?._id,
    productId: productId,
    size: selectedSize,
    color: selectedColor,
    quantity: 1,
  };

  // Hiệu ứng
  const [direction, setDirection] = useState(0);
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      position: 'absolute',
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'static',
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      position: 'absolute',
    }),
  };

  const handleNext = () => {
    if (startIndex + 3 < product.variations.length) {
      setDirection(1);
      setStartIndex((prev) => prev + 2);
    }
  }

  const handlePrev = () => {
    if (startIndex > 0) {
      setDirection(-1);
      setStartIndex((prev) => prev - 2);
    }
  }


  const { mutate: handleAddToCart, isPending: loadingAddToCart } = useAddToCart();

  return (
    <div className='productItem rounded-md w-[100%] overflow-hidden bg-white text-black shadow-lg flex items-center'>
      <div className='group imgWrapper w-[50%] xl:w-[30%] overflow-hidden  relative'>
        <Link to={`/products/${product._id}`}>
          <div className="img h-full md:h-[250px] overflow-hidden relative group">
            {Array.isArray(product?.images) && product.images.length >= 2 ? (
              <>
                {/* Ảnh chính */}
                <img
                  src={product.images[0].url}
                  className="w-full h-full object-cover"
                  alt={product.name}
                />
                {/* Ảnh hover */}
                <img
                  src={product.images[1].url}
                  className="w-full h-full object-cover absolute top-0 left-0 opacity-0 transition-all duration-1000 group-hover:opacity-100"
                  alt={product.name}
                />
              </>
            ) : product?.images?.length === 1 ? (
              <img
                src={product.images[0].url}
                className="w-full h-full object-cover"
                alt={product.name}
              />
            ) : (
              <p>No images available</p>
            )}
          </div>
        </Link>
        {/*<span className='discount flex items-center absolute top-[10px] left-[10px] z-50 bg-primary text-white p-1 rounded-xl '>-10%</span>*/}

        <div className='actions absolute transition-all duration-1000 top-[-200px] group-hover:top-[15px] right-[0px] z-50 flex items-center gap-2 flex-col w-[50px] opacity-0 group-hover:opacity-100'>
          <Tooltip title="Add" placement='left-start'>
            <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><FaRegHeart className='!text-black' /></Button>
          </Tooltip>
          <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><MdZoomOutMap className='!text-black' /></Button>
          <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><IoGitCompareOutline className='!text-black' /></Button>

        </div>
      </div>

      <div className='info p-3'>
        <h6 className='text-[14px]'><Link to={`/listing/${normalizeString(product.categoryId?.type)}`} className='link transition-all'>{product.categoryId?.type}</Link></h6>
        <h3 className='text-[16px] title mt-2 font-[500]'>
          <Link to={`/products/${product._id}`} className='link transition-all'>{product?.name.length > 25 ? product?.name.slice(0, 20) + '...' : product?.name}</Link>
        </h3>
        <div className='flex items-center gap-4'>
          <span className='newPrice text-primary font-bold'>{formatCash(product?.price)}</span>
        </div>
        <div className='flex flex-col'>
          <div className="flex my-2 gap-1 relative max-w-[150px]">
            <button onClick={handlePrev} disabled={startIndex === 0}><CgPlayTrackPrevR /></button>
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={startIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex gap-1 w-full"
              >
                {/* flex-wrap để xuống dòng nếu nhiều size */}
                {Array.isArray(product.variations) && product.variations.length > 0 ? (
                  product.variations.slice(startIndex, startIndex + 4).map((variation) => (
                    // Đặt key vào div ngoài cùng của mỗi item trong map
                    <div key={variation._id} className="flex flex-col items-center">
                      <button
                        // Không cần class 'size-button' nữa vì dùng Tailwind hết
                        className={`border rounded transition duration-300 p-1
                                    ${selectedSize === variation.size
                            ? 'bg-black text-white border-black' // Style khi được chọn
                            : 'bg-white text-black border-gray-300 hover:border-black' // Style mặc định
                          }`}
                        onClick={() => {
                          setSelectedSize(variation.size);
                          setSelectedColor(variation.color);
                          setProductId(product.productId)
                        }}
                      >
                        {variation.size}
                      </button>
                      {/* Hiển thị màu nếu cần */}
                      {/* <p className="text-xs mt-1 text-gray-500">{variation.color}</p> */}
                      {/* Hiển thị số lượng nếu cần */}
                      {/* <p className="text-xs text-gray-400">Còn: {variation.amount}</p> */}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Size not found !</p>
                )}
              </motion.div>
            </AnimatePresence>
            <button onClick={handleNext} disabled={startIndex + 4 >= product.variations.length}><CgPlayTrackNextR /></button>
          </div>
          <div>
            <Button className='!bg-black !text-white !mt-3'
              onClick={() => {
                handleAddToCart(data);
                setSelectedSize(null)
              }} // Thêm logic ở đây
            >Add To Cart</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductItemListView;