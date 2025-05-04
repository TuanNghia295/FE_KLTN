import { useEffect, useState, useMemo, Suspense, lazy } from 'react'; // Thêm Suspense, lazy
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

// --- Lazy Load Components ---
// Chỉ import LoadingComponent trực tiếp vì nó dùng làm fallback
import LoadingComponent from '../../components/LoadingComponent';
// Import động các component khác
const HomeSlider = lazy(() => import('../../components/HomeSlider'));
const ProductsSlider = lazy(() => import('../../components/ProductsSlider'));
const BlogItem = lazy(() => import('../../components/BlogItem'));
const TabsHomePage = lazy(() => import('../../components/TabsHomePage'));

import 'swiper/css';
import 'swiper/css/pagination';
import '../Home/style.css'; // Đảm bảo file này được tối ưu hoặc tree-shaking tốt
import { useBanner } from '../../services/BannerServices';
import { useProductsCategory } from '../../services/productsService';
import ChatBox from '../../components/ChatBox/ChatBox';

// Tách logic lấy số cột responsive
const getColumns = () => (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4); // Cập nhật logic responsive nếu cần

const Home = () => {
  const [columns, setColumns] = useState(getColumns);
  const { listBanner } = useBanner();
  const [cateId, setCateID] = useState('');
  const perPage = 8;
  const page = 1;
  const search = '';
  const { productCateList, loadingProductCateList } = useProductsCategory(cateId, perPage, page, search);

  // Xử lý handeChangeCate trong component
  const handeChangeCate = (value) => {
    setCateID(value);
  };

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

  // --- Fallback UI cho Suspense ---
  // Có thể tạo các fallback cụ thể hơn cho từng section nếu muốn (Skeleton Loaders)
  const SectionFallback = () => (
    <div className="container flex justify-center items-center min-h-[300px]">
      <LoadingComponent />
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* ChatBox */}
      <ChatBox />

      {/* HomeSlider - Component này nên xử lý lazy loading ảnh bên trong nó */}
      {/* Chỉ ảnh đầu tiên nên là eager, các ảnh sau là lazy */}
      <div className="relative">
        <Suspense
          fallback={
            <div className="w-full h-[60vh] bg-gray-200 flex items-center justify-center">
              <LoadingComponent />
            </div>
          }
        >
          {' '}
          {/* Fallback cho HomeSlider */}
          <HomeSlider />
        </Suspense>
      </div>

      {/* Section: Sabrina Ionescu */}
      {/* Banner tĩnh thường nằm gần đầu trang, có thể không cần lazy load component */}
      {/* nhưng cần lazy load ảnh */}
      <section className="py-5 bg-white">
        <div className="container mx-auto px-4">
          {' '}
          {/* Thêm mx-auto px-4 */}
          <div className="flex flex-col justify-center items-center mt-4 mb-5 text-center">
            {' '}
            {/* Thêm text-center */}
            <h3 className="font-bold text-base md:text-lg">Sabrina Ionescu</h3> {/* Responsive text */}
            <h3 className="text-black text-3xl md:text-5xl font-extrabold uppercase leading-tight my-1">
              Ride Easy
            </h3>{' '}
            {/* Responsive text, line-height */}
            <p className="mb-3 text-sm md:text-base text-gray-600">
              That’s the sound of Sabrina Ionescu changing the game.
            </p>{' '}
            {/* Responsive text */}
            <Link to="/listing">
              <Button variant="contained" className="!bg-black !rounded-full !px-6 !py-2">
                {' '}
                {/* Tăng padding */}
                Shop
              </Button>
            </Link>
          </div>
          {listBanner?.[4] && (
            <Link to="/listing">
              <img
                src={listBanner[4].url}
                alt={listBanner[4].alt || 'Sabrina Ionescu Banner'}
                loading="lazy" // <<< Native image lazy loading
                className="w-full object-cover rounded-md" // Thêm bo góc
                width="1200" // Cung cấp width/height giúp trình duyệt giữ chỗ
                height="600" // (Thay đổi giá trị cho phù hợp tỉ lệ ảnh)
              />
            </Link>
          )}
        </div>
      </section>

      {/* Section: Popular Products - Lazy Load cả section */}
      <section className="bg-gray-50 py-8">
        {' '}
        {/* Đổi màu nền cho khác biệt */}
        <Suspense fallback={<SectionFallback />}>
          <div className="container mx-auto px-4">
            <div className="flex flex-row items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-0">Popular Products</h2>
              <div className="ml-auto">
                {/* TabsHomePage cũng được lazy load */}
                <TabsHomePage handeChangeCate={handeChangeCate} />
              </div>
            </div>
            {/* ProductSlider được lazy load, loading data xử lý bên ngoài Suspense */}
            {loadingProductCateList ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <LoadingComponent />
              </div>
            ) : (
              <ProductsSlider listProducts={productCateList || []} />
            )}
          </div>
        </Suspense>
      </section>

      {/* Section: Don't Miss - Component tĩnh, chỉ cần lazy load ảnh */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Don't Miss</h2>
          {listBanner?.[3] && (
            <Link to="/listing">
              <img
                src={listBanner[3].url}
                alt={listBanner[3].alt || "Don't Miss Banner"}
                loading="lazy" // <<< Native image lazy loading
                className="w-full object-cover rounded-md"
                width="1200"
                height="600" // (Thay đổi giá trị cho phù hợp tỉ lệ ảnh)
              />
            </Link>
          )}
          <div className="flex flex-col justify-center text-center items-center mt-4">
            <h3 className="font-bold text-base md:text-lg">Women’s Air Jordan 4RM</h3>
            <h3 className="text-black text-3xl md:text-5xl font-extrabold uppercase leading-tight my-1">Ride Easy</h3>
            <p className="mb-3 text-sm md:text-base text-gray-600">
              This new take on a classic comes in a comfortable low profile with iconic style.
            </p>
            <Link to="/listing">
              <Button variant="contained" className="!bg-black !rounded-full !px-6 !py-2">
                Shop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Shop By Sport - Lazy Load cả section */}
      <section className="py-8 bg-gray-50 blogSection">
        {' '}
        {/* Đổi màu nền */}
        <Suspense fallback={<SectionFallback />}>
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Shop By Sport</h2>
            {/* Kiểm tra miniBanner trước khi render Swiper */}
            {miniBanner.length > 0 ? (
              <Swiper
                slidesPerView={1} // Bắt đầu từ 1 trên mobile
                spaceBetween={12}
                loop={miniBanner.length > columns} // Chỉ loop nếu đủ item
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }} // Thêm disableOnInteraction
                modules={[Pagination, Autoplay]}
                className="blogSlider"
                breakpoints={{
                  // Responsive breakpoints
                  640: { slidesPerView: 2, spaceBetween: 12 },
                  768: { slidesPerView: 3, spaceBetween: 15 },
                  1024: { slidesPerView: columns, spaceBetween: 15 }, // Sử dụng state columns
                }}
                // Giữ lại style cho pagination nếu bạn muốn tùy chỉnh cụ thể
                style={{
                  '--swiper-pagination-color': '#000', // Đổi màu cho dễ thấy trên nền sáng
                  // ... các style khác cho pagination
                  '--swiper-pagination-bullet-inactive-color': '#ccc',
                }}
              >
                {miniBanner.map(({ _id, url, alt }) => (
                  <SwiperSlide key={_id}>
                    {/* BlogItem cũng được lazy load */}
                    <BlogItem url={url} alt={alt} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-center text-gray-500">Không có mục nào để hiển thị.</p>
            )}
          </div>
        </Suspense>
      </section>
    </div>
  );
};

export default Home;
