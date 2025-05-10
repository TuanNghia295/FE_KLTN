import PropTypes from 'prop-types'; // Import thư viện prop-types
import '../ProductItem/style.css';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaRegHeart } from 'react-icons/fa';
import { IoGitCompareOutline } from 'react-icons/io5';
import { MdZoomOutMap } from 'react-icons/md';
import Tooltip from '@mui/material/Tooltip';
import { formatCash } from '../../hook/formatCash';

const ProductItem = ({ product }) => {
  return (
    <div className="productItem rounded-md w-[100%] overflow-hidden bg-white text-black shadow-lg relative">
      <div className="group imgWrapper overflow-hidden rounded-none relative">
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
        <h3 className="text-[16px] title mt-2 font-[500] mb-2">
          <Link to={`/products/${product?._id}`} className="link transition-all truncate">
            {product?.name}
          </Link>
        </h3>

        <div className="flex items-center gap-4">
          {product?.priceNew ? (
            <>
              <div className='flex gap-2'>
                <span className="newPrice text-black line-through text-[18px]">{formatCash(product?.price)}</span>
                <span className="newPrice text-red-500 text-[18px]">{formatCash(product?.priceNew)}</span>
              </div>
            </>
          ) : (
            <span className="newPrice text-black text-[18px]">{formatCash(product?.price)}</span>
          )
          }
        </div>
      </div>
    </div >
  );
};

// Định nghĩa kiểu dữ liệu cho props
ProductItem.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
      })
    ),
    categoryId: PropTypes.shape({
      type: PropTypes.string,
    }),
    _id: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  customHeight: PropTypes.string,
};

// Giá trị mặc định cho props
ProductItem.defaultProps = {
  customHeight: '250px',
};

export default ProductItem;
