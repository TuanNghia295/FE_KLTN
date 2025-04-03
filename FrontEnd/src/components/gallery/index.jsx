import { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes để xác thực props
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import ProductZoom from '../ProductZoom';

export default function Gallery({ imageProduct }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="gallery-container">
      {/* Swiper chính hiển thị hình ảnh lớn */}
      <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
        loop={true}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
        lazyPreloadPrevNext={true}
      >
        {Array.isArray(imageProduct) && imageProduct.length > 0 ? (
          imageProduct.map((image) => (
            <SwiperSlide key={image._id}>
              {' '}
              {/* Sử dụng `_id` làm key duy nhất */}
              <ProductZoom img={image.url} />
            </SwiperSlide>
          ))
        ) : (
          <p>No images available</p>
        )}
      </Swiper>

      {/* Swiper hiển thị hình ảnh thu nhỏ */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper mt-2"
      >
        {Array.isArray(imageProduct) && imageProduct.length > 0 ? (
          imageProduct.map((image) => (
            <SwiperSlide key={image._id}>
              {' '}
              {/* Sử dụng `_id` làm key duy nhất */}
              <img src={image.url} alt="Thumbnail" className="thumbnail-image" />
            </SwiperSlide>
          ))
        ) : (
          <p>No images available</p>
        )}
      </Swiper>
    </div>
  );
}

// Định nghĩa kiểu dữ liệu cho props
Gallery.propTypes = {
  imageProduct: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired, // Mỗi hình ảnh cần có `_id` duy nhất
      url: PropTypes.string.isRequired, // URL của hình ảnh
    })
  ).isRequired,
};
