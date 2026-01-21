import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import { useBanner } from '../../services/BannerServices';
import LoadingComponent from '../LoadingComponent';

const HomeSlider = () => {
  const { listBanner = [], loadingBanner } = useBanner();

  // Placeholder khi không có banner
  const defaultBanner = (
    <SwiperSlide>
      <Link to="/listing">
        <div className="w-full relative min-h-[300px]">
          <img
            className="w-full h-full object-cover"
            src="https://static.nike.com/a/images/f_auto/dpr_1.0,cs_srgb/w_1824,c_limit/bba76ce9-61bf-466b-b0f5-ac779feb333c/nike-just-do-it.png"
            alt="Jordan"
          />
          <div className="absolute inset-0 bg-black opacity-50" />
          <div className="absolute bottom-[10%] w-full flex flex-col items-center justify-center text-white z-10 px-4">
            <p className="px-4 py-2 bg-red-500 text-white rounded-full">Coming Soon!</p>
            <h1 className="text-[50px] xl:text-[200px] font-extrabold uppercase">Juka 4</h1>
            <p className="hidden xl:block w-1/2 text-center text-sm">
              Luka Dončić plays with zero remorse. He hits game winners without breaking a sweat and leaves defenders
              looking clueless—and he never feels bad about it. So what sort of shoes do you design for someone like
              that? They’ve got to be comfortable with firm support—ideal for step-backs, euro steps, and playing bully
              ball in the post. Flightwire cables. IsoPlate. Cushlon foam. Air Zoom unit. It’s all got to be in there.
              In short, you’ve got to give a bad man some really nice shoes.
            </p>
          </div>
        </div>
      </Link>
    </SwiperSlide>
  );

  // Nếu đang loading, hiển thị LoadingComponent
  if (loadingBanner) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  // Danh sách banner hoặc fallback
  const banners = Array.isArray(listBanner) && listBanner.length > 0 ? listBanner.slice(0, 3) : [];

  return (
    <Swiper
      pagination={{ dynamicBullets: true, clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      modules={[Autoplay, Pagination]}
      style={{
        '--swiper-pagination-color': '#fff',
        '--swiper-pagination-left': 'auto',
        '--swiper-pagination-right': '8px',
        '--swiper-pagination-bottom': '8px',
        '--swiper-pagination-top': 'auto',
        '--swiper-pagination-fraction-color': 'inherit',
        '--swiper-pagination-progressbar-bg-color': 'rgba(0, 0, 0, 0.25)',
        '--swiper-pagination-progressbar-size': '4px',
        '--swiper-pagination-bullet-size': '8px',
        '--swiper-pagination-bullet-width': '8px',
        '--swiper-pagination-bullet-height': '8px',
        '--swiper-pagination-bullet-inactive-color': '#000',
        '--swiper-pagination-bullet-inactive-opacity': '0.2',
        '--swiper-pagination-bullet-opacity': '1',
        '--swiper-pagination-bullet-horizontal-gap': '4px',
        '--swiper-pagination-bullet-vertical-gap': '6px',
      }}
      className="mySwiper min-h-[300px]"
    >
      {banners.length > 0
        ? banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link to="/listing">
                <img src={banner.image} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
              </Link>
            </SwiperSlide>
          ))
        : defaultBanner}
    </Swiper>
  );
};

export default HomeSlider;
