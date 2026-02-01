import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import { useBanner } from '../../services/BannerServices';
import LoadingComponent from '../LoadingComponent';

const HomeSlider = () => {
  const { listBanner = [], loadingBanner } = useBanner();
  // 1. Define the height logic here so we can reuse it
  // Assuming your navbar is roughly 60px-80px. Adjust '80px' to match your actual header height.
  const sliderHeightClass = 'h-[calc(100vh-80px)]';

  const defaultBanner = (
    <SwiperSlide>
      <Link to="/listing">
        {/* Updated class to use h-full to fill the parent SwiperSlide */}
        <div className="w-full relative h-full">
          <img
            className="w-full h-full object-cover object-center" // Ensure it covers the area
            src="https://static.nike.com/a/images/f_auto/dpr_1.0,cs_srgb/w_1824,c_limit/bba76ce9-61bf-466b-b0f5-ac779feb333c/nike-just-do-it.png"
            alt="Jordan"
          />
          <div className="absolute inset-0 bg-black opacity-50" />
          <div className="absolute bottom-[10%] w-full flex flex-col items-center justify-center text-white z-10 px-4">
            <p className="px-4 py-2 bg-red-500 text-white rounded-full">Coming Soon!</p>
            {/* Adjusted font size slightly so it fits better on smaller screens */}
            <h1 className="text-[50px] xl:text-[150px] font-extrabold uppercase">Juka 4</h1>
            <p className="hidden xl:block w-1/2 text-center text-sm">Luka Dončić plays with zero remorse...</p>
          </div>
        </div>
      </Link>
    </SwiperSlide>
  );

  if (loadingBanner) {
    return (
      <div className={`${sliderHeightClass} flex items-center justify-center`}>
        <LoadingComponent />
      </div>
    );
  }

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
        '--swiper-pagination-bottom': '20px', // Raised slightly so it's clearly visible
        // ... kept other styles same ...
        '--swiper-pagination-bullet-inactive-color': '#000',
        '--swiper-pagination-bullet-inactive-opacity': '0.2',
        '--swiper-pagination-bullet-opacity': '1',
      }}
      // APPLIED HEIGHT CLASS HERE
      className={`mySwiper w-full ${sliderHeightClass}`}
    >
      {banners.length > 0
        ? banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link to="/listing" className="block w-full h-full">
                {/* Changed to object-cover to fill screen, added w-full h-full */}
                <img
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover object-center"
                />
              </Link>
            </SwiperSlide>
          ))
        : defaultBanner}
    </Swiper>
  );
};

export default HomeSlider;
