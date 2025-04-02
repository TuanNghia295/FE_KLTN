import '../ProductItem/style.css';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaRegHeart } from 'react-icons/fa';
import { IoGitCompareOutline } from 'react-icons/io5';
import { MdZoomOutMap } from 'react-icons/md';
import Tooltip from '@mui/material/Tooltip';

const ProductItem = ({ product, customHeight }) => {
  return (
    <div className="productItem rounded-md w-[100%] overflow-hidden bg-white text-black shadow-lg relative">
      <div className="group imgWrapper overflow-hidden rounded-none relative">
        <Link to={`/product/${product.name}`}>
          <div className="img h-[150px] md:h-[250px] overflow-hidden" style={{ height: customHeight }}>
            {/* <img
              src={product.imageUrl}
              className="w-full h-full object-cover"
            />
            <img
              src={product.imageUrl}
              className="w-full h-full object-cover absolute top-[0px] left-[0px] opacity-0 transition-all duration-1000 group-hover:opacity-100"
            /> */}
            {Array.isArray(product?.images) && product?.images?.length > 0 ? (
              product.images?.map((image) => (
                <div>
                  <img src={image.url} className="w-full h-full object-cover" />
                  <img
                    src={image.url}
                    className="w-full h-full object-cover absolute top-[0px] left-[0px] opacity-0 transition-all duration-1000 group-hover:opacity-100"
                  />
                </div>
              ))
            ) : (
              <p>No images available</p>
            )}
          </div>
        </Link>

        <div className="actions absolute transition-all duration-1000 top-[-200px] group-hover:top-[15px] right-[0px] z-50 flex items-center gap-2 flex-col w-[50px] opacity-0 group-hover:opacity-100">
          <Tooltip title="Add" placement="left-start">
            <Button className="!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary">
              <FaRegHeart className="!text-black" />
            </Button>
          </Tooltip>
          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary">
            <MdZoomOutMap className="!text-black" />
          </Button>
          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !bg-white !rounded-full hover:!bg-primary">
            <IoGitCompareOutline className="!text-black" />
          </Button>
        </div>
      </div>

      <div className="info p-3">
        <h6 className="text-[14px]">
          <Link to="/" className="link transition-all">
            {product.categoryId?.type}
          </Link>
        </h6>
        <h3 className="text-[16px] title mt-2 font-[500] mb-2">
          <Link to={`/product/${product?._id}`} className="link transition-all">
            {product?.name}
          </Link>
        </h3>

        <div className="flex items-center gap-4">
          <span className="newPrice text-black text-[18px]">${product?.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
