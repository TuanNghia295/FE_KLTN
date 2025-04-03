import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import ProductItem from '../ProductItem';
import '../ProductsSlider/style.css';

const ProductsSlider = ({ listProducts }) => {
  const getColumns = () => (window.innerWidth < 768 ? 1 : 4);

  const [columns, setColumns] = useState(getColumns());

  const listProductLimited = listProducts?.slice(0, 8); // Giới hạn số lượng sản phẩm hiển thị

  useEffect(() => {
    const handleResize = () => setColumns(getColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="productsSlider mt-5 w-full">
      <div className="container">
        <Swiper
          slidesPerView={columns}
          spaceBetween={20}
          navigation={true}
          modules={[Navigation]}
          className="productSlide"
          loop={true}
        >
          {listProductLimited?.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            listProductLimited?.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductItem product={product} customHeight="300px" />
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </div>
  );
};

// Định nghĩa kiểu dữ liệu cho props
ProductsSlider.propTypes = {
  listProducts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired, // Đảm bảo mỗi sản phẩm có `_id`
      // Các thuộc tính khác của sản phẩm có thể được thêm vào đây nếu cần
    })
  ).isRequired, // `listProducts` là một mảng bắt buộc
};

export default ProductsSlider;
