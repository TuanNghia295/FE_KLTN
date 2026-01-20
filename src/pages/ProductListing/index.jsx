import React, { useEffect, useState, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import SlideBar from '../../components/SlideBar';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink, useParams } from 'react-router-dom';
import '../ProductListing/style.css';
import ProductItem from '../../components/ProductItem';
import ProductItemListView from '../../components/ProductItemListView';
import { IoGridSharp } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa';
import { LuMenu } from 'react-icons/lu';
import { Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';
import { useProducts, useProductsCategory } from '../../services/productsService';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import FilterProduct from '../../components/FilterProduct';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import debounce from 'lodash.debounce'; // Thư viện debounce

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD') // tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // xóa dấu
    .toLowerCase() // chuyển về thường
    .replace(/\s+/g, '-'); // thay khoảng trắng = dấu gạch ngang nếu cần
};

const ProductListing = () => {
  const { categoryName } = useParams(); // Lấy params. Ví dụ /nam, /nu, /tre-em,...
  const navigate = useNavigate();
  // Lấy list Category tu Zustand
  const categoryListZustand = useStore((state) => state.categoryListZustand);
  // Set Open Filter Product
  const openFilterProduct = useStore((state) => state.openFilterProduct);
  const setOpenFilterProduct = useStore((state) => state.setOpenFilterProduct);
  const toogleFilterProduct = (newOpen) => () => {
    setOpenFilterProduct(newOpen);
  };

  const getCategory = categoryName //Tìm category từ params trong Zustand
    ? categoryListZustand.find((c) => normalizeString(c.name) === normalizeString(categoryName))
    : null;

  console.log(getCategory);

  // Phân trang
  const isMobile = useMediaQuery('(max-width:768px)');
  const [search, setSearch] = useState(''); // State để lưu giá trị tìm kiếm
  const [searchCate, setSearchCate] = useState(''); // State để lưu giá trị tìm kiếm
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  // Sort states
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('');
  const [sortLabel, setSortLabel] = useState('Featured');

  // Price filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { productList, total, loadingProductList } = useProducts(
    perPage,
    page,
    search,
    sortBy,
    sortDir,
    minPrice,
    maxPrice,
    ''
  );
  const { productCateList, totalCate, loadingProductCateList } = useProductsCategory(
    getCategory?.id,
    perPage,
    page,
    searchCate,
    sortBy,
    sortDir,
    minPrice,
    maxPrice
  );
  const totalPage = getCategory ? totalCate : total;

  const [selectedCateParams, setSelectedCateParams] = useState(getCategory?.id);

  useEffect(() => {
    setSelectedCateParams(getCategory?.id);
  }, [getCategory?.id]);

  const [itemView, setItemView] = useState('grid');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Nếu có dữ liệu category thì gọi api category còn không thì hiển thị all
  const [allProducts, setAllProducts] = useState([]);
  const isLoading = getCategory ? loadingProductCateList : loadingProductList;
  const hasMore = page < totalPage;

  // Handle Change Catgegory
  const handleChangeCategory = (slug) => {
    const params = normalizeString(slug);
    if (params === categoryName) {
      // Nếu đã được chọn rồi, bỏ chọn (quay về tất cả sản phẩm)
      navigate('/listing');
    } else {
      navigate(`/listing/${params}`);
    }
  };

  // Reset sản phẩm khi đổi category hoac perPage
  useEffect(() => {
    setAllProducts([]); // Xóa toàn bộ sản phẩm cũ
    setPage(1); // Reset về trang đầu
  }, [categoryName, perPage, isMobile, sortBy, sortDir, minPrice, maxPrice]);

  useEffect(() => {
    let sourceProducts = getCategory ? productCateList : productList;

    // Kiểm tra và giảm giá nếu sản phẩm thuộc category "Sale"
    const newProducts = sourceProducts?.map((product) => {
      if (product?.categoryId?.type === 'Sale') {
        return {
          ...product,
          priceNew: product.price * 0.9, // Giảm 10%
        };
      }
      return product;
    });

    if (Array.isArray(newProducts)) {
      if (isMobile) {
        // Load More: append
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const uniqueNew = newProducts.filter((item) => !existingIds.has(item._id));
          return [...prev, ...uniqueNew];
        });
      } else {
        // Pagination: replace
        setAllProducts(newProducts);
      }
    }
  }, [productList, productCateList, isMobile, search, getCategory]);

  // Hàm xử lý tìm kiếm với debounce
  const handleSearchChange = useMemo(
    () =>
      debounce((e) => {
        setSearch(e.target.value);
        setSearchCate(e.target.value); // Cập nhật giá trị tìm kiếm neu khong phai category
        setPage(1);
        setAllProducts([]);
      }, 500),
    []
  ); // Delay 500ms sau khi người dùng ngừng nhập

  // Hàm xử lý sort
  const handleSort = (label, field, direction) => {
    setSortLabel(label);
    setSortBy(field);
    setSortDir(direction);
    setPage(1);
    setAllProducts([]);
    handleClose();
  };

  // Hàm xử lý filter theo giá
  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
    setAllProducts([]);
  };

  return (
    <section className="pt-3 sm:pt-5">
      <div className="container !text-center">
        <div className="flex justify-center p-3 sm:p-4 bg-gray-100 rounded-md">
          {' '}
          {/* Thêm nền cho dễ nhìn */}
          <Breadcrumbs aria-label="breadcrumb" className="text-xs sm:text-sm">
            <RouterLink to="/" className="hover:underline text-inherit">
              {' '}
              {/* Sử dụng RouterLink */}
              Home Page
            </RouterLink>
            <RouterLink to="/listing" className="hover:underline text-inherit">
              {' '}
              {/* Sử dụng RouterLink */}
              Listing
            </RouterLink>
            {getCategory ? <Typography sx={{ color: 'text.primary' }}>{getCategory?.name}</Typography> : ''}
          </Breadcrumbs>
        </div>
        <h3 className="font-bold text-black text-[20px] sm:text-[24px] md:text-[30px] mt-3 sm:mt-4 px-2">
          {getCategory ? `${getCategory.name.toUpperCase()} COLLECTION` : 'ALL COLLECTION'}
        </h3>
      </div>
      <div className="bg-white p-2 sm:p-3 mt-3 sm:mt-4">
        <div className="flexProductPage container flex flex-col md:flex-row gap-3">
          <div className="slidebarWrapper hidden md:block sm:w-[100%] md:w-[40%] xl:w-[20%] h-full bg-white">
            <SlideBar
              categoryListZustand={categoryListZustand}
              selectedCate={selectedCateParams}
              onCategorySelect={handleChangeCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
            />
            {/*<FilterProduct perPage={perPage} setPerPage={setPerPage} />*/}
          </div>
          <div className="rightContent w-[100%] xl:w-[80%]">
            <div className="bg-[#f1f1f1] p-2 md:p-3 w-full mb-3 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="col1 flex items-center gap-1 itemViewActions">
                <Button
                  className={`md:!hidden !w-[36px] !h-[36px] sm:!w-[40px] sm:!h-[40px] !min-w-[36px] sm:!min-w-[40px] !rounded-full !text-[#000] ${
                    openFilterProduct === true && 'active'
                  }`}
                  onClick={() => setOpenFilterProduct(true)}
                >
                  <FaFilter className="text-[rgba(0,0,0,0.7)] text-sm sm:text-base" />
                </Button>
                <Button
                  className={`!w-[36px] !h-[36px] sm:!w-[40px] sm:!h-[40px] !min-w-[36px] sm:!min-w-[40px] !rounded-full !text-[#000] ${
                    itemView === 'grid' && 'active'
                  }`}
                  onClick={() => setItemView('grid')}
                >
                  <IoGridSharp className="text-[rgba(0,0,0,0.7)] text-sm sm:text-base" />
                </Button>
                <Button
                  className={`!w-[36px] !h-[36px] sm:!w-[40px] sm:!h-[40px] !min-w-[36px] sm:!min-w-[40px] !rounded-full !text-[#000] ${
                    itemView === 'list' && 'active'
                  }`}
                  onClick={() => setItemView('list')}
                >
                  <LuMenu className="text-sm sm:text-base" />
                </Button>
              </div>
              <div className="col2 w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:pr-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[12px] sm:text-[14px] font-[500] text-[rgba(0,0,0,0.7)] whitespace-nowrap">
                    Sort By
                  </span>
                  <Button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    className="!bg-white !text-[10px] sm:!text-[12px] !text-[#000] !capitalize !border-2 !border-[#000] !px-2 sm:!px-3 !py-1 sm:!py-1.5 !min-w-[120px] sm:!min-w-0"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-none">{sortLabel}</span> &nbsp;
                    <FaAngleDown className="ml-auto" />
                  </Button>
                </div>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={() => handleSort('Featured', '', '')}>Featured</MenuItem>
                  <MenuItem onClick={() => handleSort('Alphabetically, A-Z', 'name', 'asc')}>
                    Alphabetically, A-Z
                  </MenuItem>
                  <MenuItem onClick={() => handleSort('Alphabetically, Z-A', 'name', 'desc')}>
                    Alphabetically, Z-A
                  </MenuItem>
                  <MenuItem onClick={() => handleSort('Price, low to high', 'price', 'asc')}>
                    Price, low to high
                  </MenuItem>
                  <MenuItem onClick={() => handleSort('Price, high to low', 'price', 'desc')}>
                    Price, high to low
                  </MenuItem>
                  <MenuItem onClick={() => handleSort('Date, old to new', 'created_at', 'asc')}>
                    Date, old to new
                  </MenuItem>
                  <MenuItem onClick={() => handleSort('Date, new to old', 'created_at', 'desc')}>
                    Date, new to old
                  </MenuItem>
                </Menu>
                {/* Input tìm kiếm */}
                <input
                  type="text"
                  placeholder="Search products..."
                  onChange={handleSearchChange}
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:border-[#494949] focus:ring-1 focus:ring-[#494949] w-full sm:w-auto sm:min-w-[200px]"
                />
              </div>
            </div>
            {/* Phần hiển thị */}
            <div
              className={`grid ${itemView === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-3 md:gap-4`}
            >
              {itemView === 'grid' ? (
                <>
                  {Array.isArray(allProducts) && allProducts.length === 0 ? (
                    <p className="col-span-full text-center py-8 text-gray-500">No products found.</p>
                  ) : (
                    allProducts?.map((product, index) => <ProductItem key={index} product={product} />)
                  )}
                </>
              ) : (
                <>
                  {Array.isArray(allProducts) && allProducts.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No products found.</p>
                  ) : (
                    allProducts?.map((product) => (
                      <ProductItemListView key={product._id} product={product} normalizeString={normalizeString} />
                    ))
                  )}
                </>
              )}
            </div>
            {isLoading ? (
              <div className="flex justify-center py-6 md:py-8">
                <CircularProgress color="inherit" size={30} />
              </div>
            ) : (
              ''
            )}
            <div className="flex w-full items-center justify-center mt-4 md:mt-5 px-2">
              {isMobile ? (
                hasMore && (
                  <button
                    className="border border-[#b8b8b8] shadow-sm bg-white rounded-md text-black w-full py-2.5 sm:py-3 text-sm sm:text-base hover:bg-gray-50 transition-colors"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load More...
                  </button>
                )
              ) : (
                <Pagination
                  count={totalPage}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  showFirstButton
                  showLastButton
                  size={window.innerWidth < 640 ? 'small' : 'medium'}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Drawer open={openFilterProduct} onClose={toogleFilterProduct(false)} anchor={'left'} className="filterPanel">
        <FilterProduct
          perPage={perPage}
          setPerPage={setPerPage}
          selectedCate={selectedCateParams}
          onCategorySelect={handleChangeCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
        />
      </Drawer>
    </section>
  );
};

export default ProductListing;
