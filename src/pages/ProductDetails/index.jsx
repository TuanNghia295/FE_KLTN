import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Button, CircularProgress, Box, Snackbar, Alert, Modal } from '@mui/material';

import Gallery from '../../components/gallery';
import HomeCartSlider from '../../components/HomeCartSlider';
import { useProductDetail, useProducts } from '../../services/productsService';

import '../ProductDetails/style.css';

import useStore from '../../store/useStore';
import { useAddToCart } from '../../services/cartServices';

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const ProductDetails = () => {
  const { mutateAsync: handleAddToCart, isPending: loadingAddToCart } = useAddToCart();
  const navigate = useNavigate();
  const { id } = useParams();

  const userInfo = useStore((state) => state.userInfo);

  const { productDetail, isLoading, error } = useProductDetail(id);
  const { productList, loadingProductList } = useProducts();

  // Transform image_thumbnails array into the format Gallery expects
  const formattedImages =
    productDetail?.image_thumbnails?.map((url, index) => ({
      _id: `${productDetail.id}-${index}`,
      url: url,
    })) || [];

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [slidesPerView, setSlidesPerView] = useState(() => {
    const width = window.innerWidth;
    return width > 1024 ? 4 : width > 600 ? 3 : 3;
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setSlidesPerView(width > 1024 ? 4 : width > 600 ? 3 : 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter related products based on the new data structure
  const relativeProductList =
    Array.isArray(productList) && productList.length > 0
      ? productList.filter(
          (product) => product?.category_id === productDetail?.category_id && product.id !== Number(id)
        )
      : [];

  // Transform products data to match HomeCartSlider expected format
  const formattedRelativeProducts = relativeProductList.map((product) => ({
    _id: product.id.toString(),
    name: product.name,
    price: parseFloat(product.price),
    images:
      product.image_thumbnails?.map((url, index) => ({
        url: url,
        isPrimary: index === 0, // First image is primary
      })) || [],
  }));

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

  if (!productDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Product not found.</Typography>
      </Box>
    );
  }

  const data = {
    userId: userInfo?.id ?? userInfo?._id,
    productId: productDetail?.id,
    product_variant_id: selectedVariantId,
    size: selectedSize,
    color: selectedColor,
    quantity: 1,
    product: {
      _id: productDetail?.id?.toString(),
      productId: productDetail?.id,
      name: productDetail?.name,
      price: parseFloat(productDetail?.price),
      images:
        productDetail?.image_thumbnails?.map((url, index) => ({
          url,
          isPrimary: index === 0,
        })) || [],
      variations: productDetail?.variants || [],
    },
  };

  const handleAddToCartClick = () => {
    handleAddToCart(data);
  };

  const handleBuyNow = async (data) => {
    if (!userInfo) {
      setShowLoginModal(true);
      sessionStorage.setItem('returnTo', '/checkout');
      return;
    }
    Promise.all([handleAddToCart(data)]).then(() => {
      navigate('/checkout');
    });
  };

  return (
    <div className="h-full">
      <div className="flex justify-center p-4 bg-gray-100">
        <Breadcrumbs aria-label="breadcrumb">
          <RouterLink to="/" className="hover:underline text-inherit">
            Home Page
          </RouterLink>
          <Typography sx={{ color: 'text.primary' }}>{productDetail.name}</Typography>
        </Breadcrumbs>
      </div>

      <section className="bg-white py-5">
        <div className="container mx-auto px-4 flex flex-col gap-8">
          <div className="flex justify-center xl:justify-evenly flex-col xl:flex-row gap-8 xl:gap-4">
            <div className="productZoomContainer custom-scrollbar w-full xl:w-[45%] xl:max-w-[600px] mx-auto xl:mx-0 overflow-x-auto xl:overflow-x-hidden">
              {formattedImages.length > 0 ? (
                <Gallery imageProduct={formattedImages} />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Images Available</div>
              )}
            </div>

            <div className="p-5 w-full xl:w-[40%]">
              <h1 className="text-3xl font-semibold text-black mb-2">{productDetail.name}</h1>
              <p className="text-2xl font-semibold text-red-600 mb-4">{formatCurrency(productDetail.price)}</p>

              <h2 className="text-lg font-medium mb-2 text-black">Choose Size</h2>
              <div className="flex flex-wrap gap-3 mb-5">
                {Array.isArray(productDetail.variants) && productDetail.variants.length > 0 ? (
                  productDetail.variants.map((variant) => (
                    <div key={variant.id} className="flex flex-col items-center">
                      <button
                        className={`border min-w-14 text-center px-4 py-2 rounded transition duration-300
                                    ${
                                      selectedSize === variant.size
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-300 hover:border-black'
                                    }`}
                        onClick={() => {
                          setSelectedSize(variant.size);
                          setSelectedColor(variant.color);
                          setSelectedVariantId(variant.id);
                        }}
                      >
                        {variant.size}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Size not found!</p>
                )}
              </div>

              <Button
                variant="contained"
                className="!bg-[#f1f1f1] !text-black !w-full !py-3 !mb-3 !shadow-none hover:!bg-gray-300"
                disabled={!selectedSize}
                onClick={() => handleAddToCartClick()}
              >
                {loadingAddToCart ? 'Loading...' : 'Add To Cart'}
              </Button>
              <Button
                variant="contained"
                className="!bg-black !text-white !w-full !py-3 !shadow-md hover:!bg-gray-800"
                onClick={() => {
                  if (!selectedSize) {
                    setShowSnackbar(true);
                  } else {
                    handleBuyNow(data);
                  }
                }}
              >
                Buy Now
              </Button>

              <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert onClose={() => setShowSnackbar(false)} severity="warning" sx={{ width: '100%' }}>
                  Please select a size before adding to cart.
                </Alert>
              </Snackbar>

              <Modal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                BackdropProps={{ style: { backgroundColor: 'rgba(0,0,0,0.3)' } }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 24,
                    maxWidth: 350,
                    width: '90%',
                    mx: 'auto',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    You need to log in to use this feature.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowLoginModal(false);
                      sessionStorage.setItem('returnTo', '/checkout');
                      navigate('/login');
                    }}
                    sx={{
                      bgcolor: 'black',
                      color: 'white',
                      py: 1.2,
                      px: 2,
                      width: '100%',
                      mb: 1.5,
                      fontWeight: 600,
                      fontSize: 16,
                      '&:hover': { bgcolor: '#333' },
                    }}
                  >
                    Log in now
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowLoginModal(false)}
                    sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Modal>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2 text-black">Description</h3>
                <p className="text-gray-700 leading-relaxed">{productDetail.description}</p>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 pl-4 md:pl-0">Related Products</h2>
            <HomeCartSlider
              slidesPerView={slidesPerView}
              data={formattedRelativeProducts}
              categoryId={productDetail.category_id}
              currentProductId={productDetail.id}
            />
          </section>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
