import React, { useState } from 'react'
import "../ProductItemListView/style.css"
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { formatCash } from '../../hook/formatCash';
import useStore from '../../store/useStore';
import { useAddToCart } from '../../services/cartServices';;
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { FaCartPlus } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

const ProductItemListView = ({ product, normalizeString }) => {
  const userInfo = useStore((state) => state.userInfo);
  const [productId, setProductId] = useState('') // State lưu productID
  const [selectedSize, setSelectedSize] = useState(null); // State lưu size đã chọn
  const [selectedColor, setSelectedColor] = useState(null); // State lưu color đã chọn
  const [startIndex, setStartIndex] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const data = {
    userId: userInfo?._id,
    productId: productId,
    size: selectedSize,
    color: selectedColor,
    quantity: 1,
  };

  const { mutate: handleAddToCart, isPending: loadingAddToCart } = useAddToCart();

  return (
    <div className='productItem rounded-md w-[100%] overflow-hidden bg-white text-black shadow-lg flex items-center justify-between p-2 md:p-0'>
      <div className='group imgWrapper w-[15%] md:w-[10%] overflow-hidden  relative'>
        <Link to={`/products/${product._id}`}>
          <div className="img overflow-hidden relative group rounded-full md:rounded-none">
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
        {/* 
        <div className='actions absolute transition-all duration-1000 top-[-200px] group-hover:top-[15px] right-[0px] z-50 flex items-center gap-2 flex-col w-[50px] opacity-0 group-hover:opacity-100'>
          <Tooltip title="Add" placement='left-start'>
            <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><FaRegHeart className='!text-black' /></Button>
          </Tooltip>
          <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><MdZoomOutMap className='!text-black' /></Button>
          <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary'><IoGitCompareOutline className='!text-black' /></Button>

        </div> */}
      </div>

      <div className='info p-3 w-[40%]'>
        {/* <h6 className='text-[14px]'><Link to={`/listing/${normalizeString(product.categoryId?.type)}`} className='link transition-all'>{product.categoryId?.type}</Link></h6> */}
        <h3 className='text-[16px] title font-[500]'>
          <Link to={`/products/${product._id}`} className='link transition-all'>{product?.name.length > 15 ? product?.name.slice(0, 10) + '...' : product?.name}</Link>
        </h3>
      </div>

      <div className='info-col2 w-[35%] text-center'>
        <span className='newPrice font-bold border border-[#ccc] py-1 px-3 bg-[#f0f0f0] text-black rounded-md'>{formatCash(product?.price)}</span>
      </div>

      <div className='info-col3 w-[15%] text-center'>
        <Tooltip title="Add to Cart">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'addtocart-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <FaCartPlus className='text-black text-[20px]' />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="addtocart-menu"
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <p className='p-2'>Choose Size</p>
          <Divider />
          <div className='w-full'>
            {/* flex-wrap để xuống dòng nếu nhiều size */}
            {Array.isArray(product.variations) && product.variations.length > 0 ? (
              product.variations.map((variation) => (
                <MenuItem key={variation._id} className={`flex flex-col items-center ${selectedSize === variation.size ? '!bg-[#f1f1f1]' : '!bg-white'}`}
                  onClick={() => {
                    setSelectedSize(variation.size);
                    setSelectedColor(variation.color);
                    setProductId(product.productId)
                  }}
                >
                  {/* // Đặt key vào div ngoài cùng của mỗi item trong map */}
                      {variation.size}
                </MenuItem>
              ))
            ) : (
              <p className="text-gray-500">Size not found !</p>
            )}
          </div>
          <Divider />
          <MenuItem
            className='!flex !items-center !flex-col'
            onClick={() => {
              handleClose()
              handleAddToCart(data);
              setSelectedSize(null)
            }} // Thêm logic ở đây
          >
            {loadingAddToCart ? <CircularProgress className='!w-6 !h-6' color="inherit" /> : <FaCheck className='!text-[20px] text-black' />}
          </MenuItem>
        </Menu>
      </div>
    </div>
  )
}

export default ProductItemListView;