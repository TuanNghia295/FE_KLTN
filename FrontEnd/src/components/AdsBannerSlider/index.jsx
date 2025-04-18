import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import BannerBox from '../BannerBox';
import Adsbanner1 from '../../assets/ads-banner/adsbanner1.png';
const AdsBannerSlider = (props) => {
  return (
    <div className="w-full py-5">
      <Swiper
        slidesPerView={props.items}
        spaceBetween={10}
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
        
      >
        <SwiperSlide>
          <BannerBox img={Adsbanner1} link={'/login'}></BannerBox>
        </SwiperSlide>

        <SwiperSlide>
          <BannerBox
            img="https://i.pinimg.com/originals/05/8c/a5/058ca55eae5b86fa8a4d52c1d1e5a4a4.jpg"
            link={'/bags'}
          ></BannerBox>
        </SwiperSlide>

        <SwiperSlide>
          <BannerBox
            img="https://i.pinimg.com/originals/05/8c/a5/058ca55eae5b86fa8a4d52c1d1e5a4a4.jpg"
            link={'/electronics'}
          ></BannerBox>
        </SwiperSlide>

        <SwiperSlide>
          <BannerBox
            img="https://i.pinimg.com/originals/05/8c/a5/058ca55eae5b86fa8a4d52c1d1e5a4a4.jpg"
            link={'/haha'}
          ></BannerBox>
        </SwiperSlide>

        <SwiperSlide>
          <BannerBox
            img="https://i.pinimg.com/originals/05/8c/a5/058ca55eae5b86fa8a4d52c1d1e5a4a4.jpg"
            link={'/haha'}
          ></BannerBox>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default AdsBannerSlider;
