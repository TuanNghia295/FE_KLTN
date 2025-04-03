import { useEffect, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeSlider from '../../components/HomeSlider';
import ProductsSlider from '../../components/ProductsSlider';
import BlogItem from '../../components/BlogItem';
import TabsHomePage from '../../components/TabsHomePage';
import LoadingComponent from '../../components/LoadingComponent';
import 'swiper/css';
import 'swiper/css/pagination';
import '../Home/style.css';
import { useBanner } from '../../services/BannerServices';
import { useProducts } from '../../services/productsService';

// Tách logic lấy số cột responsive
const getColumns = () => (window.innerWidth < 768 ? 1 : 4);

const Home = () => {
  const [columns, setColumns] = useState(getColumns);
  const { listBanner } = useBanner(); // Sử dụng hook để lấy danh sách banner
  const { productList, loadingProductList } = useProducts(); // Sử dụng hook để lấy danh sách sản phẩm

  // Xử lý responsive columns
  useEffect(() => {
    const handleResize = () => setColumns(getColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tính toán miniBanner chỉ khi `listBanner` thay đổi
  const miniBanner = useMemo(() => {
    return Array.isArray(listBanner) && listBanner.length > 0 ? listBanner.slice(5) : [];
  }, [listBanner]);

  return (
    <div className="bg-white min-h-screen">
      {/* HomeSlider */}
      <div className="relative !min-h-[800px]">
        <HomeSlider />
      </div>

      {/* Section: Sabrina Ionescu */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="flex flex-col justify-center items-center mt-4 mb-5">
            <h3 className="font-bold text-[16px]">Sabrina Ionescu</h3>
            <h3 className="text-black text-[48px] font-[800] uppercase">Ride Easy</h3>
            <p className="mb-2">That’s the sound of Sabrina Ionescu changing the game.</p>
            <Link to="/listing">
              <Button variant="contained" className="!bg-black !rounded-full">
                Shop
              </Button>
            </Link>
          </div>
          {listBanner?.[4] && (
            <Link to="/listing">
              <img src={listBanner[4].url} alt={listBanner[4].alt} className="w-full object-cover" />
            </Link>
          )}
        </div>
      </section>

      {/* Section: Popular Products */}
      <section className="bg-white py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-[600]">Popular Products</h2>
            <div className="ml-auto">
              <TabsHomePage />
            </div>
          </div>
          {loadingProductList ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoadingComponent />
            </div>
          ) : (
            <ProductsSlider listProducts={productList || []} />
          )}
        </div>
      </section>

      {/* Section: Don't Miss */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-[20px] font-[600] mb-4">Don't Miss</h2>
          {listBanner?.[3] && (
            <Link to="/listing">
              <img src={listBanner[3].url} alt={listBanner[3].alt} className="w-full object-cover" />
            </Link>
          )}
          <div className="flex flex-col justify-center text-center items-center mt-4">
            <h3 className="font-bold text-[16px]">Women’s Air Jordan 4RM</h3>
            <h3 className="text-black text-[48px] font-[800] uppercase">Ride Easy</h3>
            <p className="mb-2">This new take on a classic comes in a comfortable low profile with iconic style.</p>
            <Link to="/listing">
              <Button variant="contained" className="!bg-black !rounded-full">
                Shop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Shop By Sport */}
      <section className="py-5 pb-8 bg-white blogSection">
        <div className="container">
          <h2 className="text-[20px] font-[600] mb-4">Shop By Sport</h2>
          <Swiper
            slidesPerView={columns}
            spaceBetween={12}
            loop={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            modules={[Pagination, Autoplay]}
            className="blogSlider"
            style={{
              '--swiper-pagination-color': '#fff',
              '--swiper-pagination-left': 'auto',
              '--swiper-pagination-right': '8px',
              '--swiper-pagination-bottom': '8px',
              '--swiper-pagination-top': 'auto',
              '--swiper-pagination-bullet-size': '8px',
              '--swiper-pagination-bullet-inactive-color': '#000',
              '--swiper-pagination-bullet-inactive-opacity': '0.2',
              '--swiper-pagination-bullet-opacity': '1',
              '--swiper-pagination-bullet-horizontal-gap': '4px',
              '--swiper-pagination-bullet-vertical-gap': '6px',
            }}
          >
            {miniBanner.map(({ _id, url, alt }) => (
              <SwiperSlide key={_id}>
                <BlogItem url={url} alt={alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
};

export default Home;
