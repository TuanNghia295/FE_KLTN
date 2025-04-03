import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink, useParams } from 'react-router-dom'; // Import Link as RouterLink
import { Button, CircularProgress, Box } from '@mui/material'; // Import CircularProgress for loading

// Giả sử Gallery là component hiển thị ảnh (có thể có zoom tích hợp)
import Gallery from '../../components/gallery';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useProductDetail, useProducts } from '../../services/productsService'; // Hook lấy dữ liệu

import '../ProductDetails/style.css'; // <<<--- DÒNG NÀY ĐÃ BỊ XÓA

// Hàm định dạng tiền tệ (Ví dụ)
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const ProductDetails = () => {
  const { id } = useParams();
  const { productDetail, isLoading, error } = useProductDetail(id); // Giả sử hook trả về cả trạng thái loading và error
  const { productList, loadingProductList } = useProducts();

  // console.log('Product List:', productList);

  const relativeProductList =
    Array.isArray(productList) && productList.length > 0
      ? productList.filter(
          (product) => product?.categoryId?._id === productDetail?.categoryId?._id && product._id !== id
        )
      : []; // Lọc sản phẩm liên quan

  const [selectedSize, setSelectedSize] = useState(null); // State lưu size đã chọn

  // Lấy ra tỉ lệ màn hình hiện tại để xác định số lượng slide hiển thị
  const [slidesPerView, setSlidesPerView] = useState(() => {
    const width = window.innerWidth;
    return width > 1024 ? 4 : width > 600 ? 3 : 3;
  });

  // Cập nhật slidesPerView khi resize (Tùy chọn, nếu cần responsive thực sự)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setSlidesPerView(width > 1024 ? 4 : width > 600 ? 3 : 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // Cleanup listener
  }, []);

  // ---- Xử lý trạng thái Loading và Error ----
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">Failed to load product details. Please try again later.</Typography>
      </Box>
    );
  }

  // ---- Xử lý khi không tìm thấy sản phẩm ----
  if (!productDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Product not found.</Typography>
      </Box>
    );
  }

  // ---- Render khi có dữ liệu ----
  return (
    <div className="h-full">
      {/* Breadcrumbs động */}
      <div className="flex justify-center p-4 bg-gray-100">
        {' '}
        {/* Thêm nền cho dễ nhìn */}
        <Breadcrumbs aria-label="breadcrumb">
          <RouterLink to="/" className="hover:underline text-inherit">
            {' '}
            {/* Sử dụng RouterLink */}
            Trang chủ
          </RouterLink>
          {/* Bạn có thể thêm link Category ở đây nếu có */}
          {/* <RouterLink to={`/category/${productDetail.categoryId?._id}`} className="hover:underline text-inherit">
            {productDetail.categoryId?.type || 'Category'}
          </RouterLink> */}
          <Typography sx={{ color: 'text.primary' }}>{productDetail.name}</Typography>
        </Breadcrumbs>
      </div>

      <section className="bg-white py-5">
        <div className="container mx-auto px-4 flex flex-col gap-8">
          {' '}
          <div className="flex justify-center xl:justify-evenly flex-col xl:flex-row gap-8 xl:gap-4">
            <div className="productZoomContainer custom-scrollbar w-full xl:w-[45%] xl:max-w-[600px] mx-auto xl:mx-0 overflow-x-auto xl:overflow-x-hidden">
              {productDetail.images && productDetail.images.length > 0 ? (
                <Gallery imageProduct={productDetail.images} />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Images Available</div>
              )}
            </div>

            {/* Thông tin sản phẩm, size, addtoCart và description */}
            <div className="p-5 w-full xl:w-[40%]">
              <h1 className="text-3xl font-semibold text-black mb-2">{productDetail.name}</h1>
              <p className="text-2xl font-semibold text-red-600 mb-4">{formatCurrency(productDetail.price)}</p>

              {/* Size component logic */}
              <h2 className="text-lg font-medium mb-2 text-black">Chọn Size</h2>
              <div className="flex flex-wrap gap-3 mb-5">
                {' '}
                {/* flex-wrap để xuống dòng nếu nhiều size */}
                {Array.isArray(productDetail.variations) && productDetail.variations.length > 0 ? (
                  productDetail.variations.map((variation) => (
                    // Đặt key vào div ngoài cùng của mỗi item trong map
                    <div key={variation._id} className="flex flex-col items-center">
                      <button
                        // Không cần class 'size-button' nữa vì dùng Tailwind hết
                        className={`border min-w-14 text-center px-4 py-2 rounded transition duration-300
                                    ${
                                      selectedSize === variation.size
                                        ? 'bg-black text-white border-black' // Style khi được chọn
                                        : 'bg-white text-black border-gray-300 hover:border-black' // Style mặc định
                                    }`}
                        onClick={() => setSelectedSize(variation.size)}
                      >
                        {variation.size}
                      </button>
                      {/* Hiển thị màu nếu cần */}
                      {/* <p className="text-xs mt-1 text-gray-500">{variation.color}</p> */}
                      {/* Hiển thị số lượng nếu cần */}
                      {/* <p className="text-xs text-gray-400">Còn: {variation.amount}</p> */}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Không có thông tin size.</p>
                )}
              </div>

              {/* Nút bấm */}
              <Button
                variant="contained" // Sử dụng variant của MUI cho rõ ràng
                className="!bg-[#f1f1f1] !text-black !w-full !py-3 !mb-3 !shadow-none hover:!bg-gray-300"
                disabled={!selectedSize} // Vô hiệu hóa nếu chưa chọn size
                onClick={() => console.log('Add to cart:', productDetail._id, selectedSize)} // Thêm logic ở đây
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="contained"
                className="!bg-black !text-white !w-full !py-3 !shadow-md hover:!bg-gray-800"
                disabled={!selectedSize} // Vô hiệu hóa nếu chưa chọn size
                onClick={() => console.log('Buy now:', productDetail._id, selectedSize)} // Thêm logic ở đây
              >
                Mua ngay
              </Button>

              {/* Mô tả sản phẩm */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2 text-black">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">{productDetail.description}</p>
              </div>
            </div>
          </div>
          {/* Sản phẩm liên quan */}
          <section className="mt-10">
            {' '}
            {/* Thêm khoảng cách trên */}
            <h2 className="text-2xl font-semibold mb-4 pl-4 md:pl-0">Sản phẩm liên quan</h2>
            {/* Truyền slidesPerView từ state */}
            <HomeCartSlider
              slidesPerView={slidesPerView}
              data={relativeProductList}
              categoryId={productDetail.categoryId?._id}
              currentProductId={productDetail._id}
            />{' '}
            {/* Truyền categoryId và productId hiện tại để lọc */}
          </section>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
