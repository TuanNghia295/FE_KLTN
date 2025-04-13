import React from 'react'
import "../ProductItemListView/style.css"
import { Link } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';
import { FaRegHeart } from "react-icons/fa"
import { IoGitCompareOutline } from "react-icons/io5"
import { MdZoomOutMap } from "react-icons/md"
import Tooltip from '@mui/material/Tooltip';
import { formatCash } from '../../hook/formatCash';


const ProductItemListView = ({ product, normalizeString }) => {

  return (
    <div className='productItem rounded-md w-[100%] overflow-hidden bg-white text-black shadow-lg flex items-center'>
      <div className='group imgWrapper w-[50%] xl:w-[20%] overflow-hidden  relative'>
        <Link to={`/products/${product._id}`}>
          <div className="img h-[200px] md:h-[220px] overflow-hidden">
            {Array.isArray(product?.images) && product?.images?.length > 0 ? (
              product.images.map((image, index) => (
                <div key={index}>
                  <img src={image.url} className="w-full h-full object-cover" alt={product.name} />
                  <img
                    src={image.url}
                    className="w-full h-full object-cover absolute top-[0px] left-[0px] opacity-0 transition-all duration-1000 group-hover:opacity-100"
                    alt={product.name}
                  />
                </div>
              ))
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
          <Link to={`/products/${product._id}`} className='link transition-all'>{product?.name}</Link>
        </h3>
        <p>{product?.description.length > 100 ? product?.description.slice(0, 20) + '...' : product?.description}</p>
        <div className='flex items-center gap-4'>
          <span className='newPrice text-primary font-bold'>{formatCash(product?.price)}</span>
        </div>
        <div>
          {/* <Button className='!bg-black !text-white !mt-3'>Add To Cart</Button> */}
        </div>
      </div>
    </div>
  )
}

export default ProductItemListView;