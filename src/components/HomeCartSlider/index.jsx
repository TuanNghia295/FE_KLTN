import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './style.css'; // Import tệp CSS tùy chỉnh

import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { formatCash } from '../../hook/formatCash';
import PropTypes from 'prop-types'; // Import PropTypes để xác thực props

const HomeCartSlider = ({ slidesPerView, data }) => {
  return (
    <div className="home-cart-slider mt-5 mb-5">
      <div className="container">
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation]}
          className="mySwiper"
        >
          {data?.map((item) => {
            const { _id, name, price, images } = item;
            const primaryImage = images?.find((image) => image.isPrimary)?.url || images?.[0]?.url;

            return (
              <SwiperSlide key={_id}>
                <Link to={`/products/${_id}`}>
                  <div className="item py-7 px-3 bg-white rounded-sm flex text-center items-center justify-center flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={primaryImage}
                      alt={name}
                      className="transition-all duration-300 ease-in-out transform hover:scale-105 object-contain"
                    />
                    <h3 className="text-[16px] font-[500] mt-2">{name}</h3>
                    <p className="text-[14px] text-gray-500 mt-1">{formatCash(price)}</p>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

// Định nghĩa kiểu dữ liệu cho props
HomeCartSlider.propTypes = {
  slidesPerView: PropTypes.number.isRequired, // slidesPerView là số và bắt buộc
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired, // Mỗi sản phẩm cần có `_id` duy nhất
      name: PropTypes.string.isRequired, // Tên sản phẩm
      price: PropTypes.number.isRequired, // Giá sản phẩm
      images: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired, // URL của hình ảnh
          isPrimary: PropTypes.bool, // Hình ảnh chính
        })
      ).isRequired,
    })
  ).isRequired, // data là một mảng các object và bắt buộc
};

export default HomeCartSlider;
