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
import { FaFilter } from "react-icons/fa";
import { LuMenu } from 'react-icons/lu';
import { Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';
import { useProducts, useProductsCategory } from '../../services/productsService';
import useStore from '../../store/useStore'
import { useNavigate } from 'react-router-dom';
import FilterProduct from '../../components/FilterProduct'
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import debounce from 'lodash.debounce';  // Thư viện debounce

const normalizeString = (str) => {
  if (!str) return "";
  return str
    .normalize('NFD')                   // tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '')    // xóa dấu
    .toLowerCase()                      // chuyển về thường
    .replace(/\s+/g, '-')               // thay khoảng trắng = dấu gạch ngang nếu cần
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
    setOpenFilterProduct(newOpen)
  }

  const getCategory = categoryName //Tìm category từ params trong Zustand
    ? categoryListZustand.find(
      (c) => normalizeString(c.type) === normalizeString(categoryName)
    )
    : null;

  console.log(getCategory)

  // Phân trang
  const isMobile = useMediaQuery('(max-width:768px)');
  const [search, setSearch] = useState('');  // State để lưu giá trị tìm kiếm
  const [searchCate, setSearchCate] = useState('');  // State để lưu giá trị tìm kiếm
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  const { productList, total, loadingProductList } = useProducts(perPage, page, search);
  const { productCateList, totalCate, loadingProductCateList } = useProductsCategory(getCategory?._id, perPage, page, searchCate);
  const totalPage = getCategory ? totalCate : total

  const [selectedCateParams, setSelectedCateParams] = useState(getCategory?._id)

  useEffect(() => {
    setSelectedCateParams(getCategory?._id)
  }, [getCategory?._id])


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
  const isLoading = getCategory ? loadingProductCateList : loadingProductList
  const hasMore = page < totalPage

  // Handle Change Catgegory
  const handleChangeCategory = (slug) => {
    const params = normalizeString(slug)
    if (params === categoryName) {
      // Nếu đã được chọn rồi, bỏ chọn (quay về tất cả sản phẩm)
      navigate('/listing');
    } else {
      navigate(`/listing/${params}`);
    }
  }

  // Reset sản phẩm khi đổi category hoac perPage
  useEffect(() => {
    setAllProducts([]);     // Xóa toàn bộ sản phẩm cũ
    setPage(1);             // Reset về trang đầu
  }, [categoryName, perPage, isMobile]);

  useEffect(() => {
    let newProducts = getCategory ? productCateList : productList;
  
    if (getCategory?.type === 'Sale') {
      newProducts = productCateList?.map(product => ({
        ...product,
        priceNew: product.price * 0.9, // giảm 10%
      }));
    }
  
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
  }, [productList, productCateList, isMobile, search]);
  

  // Hàm xử lý tìm kiếm với debounce
  const handleSearchChange = useMemo(() => debounce((e) => {
    setSearch(e.target.value);
    setSearchCate(e.target.value) // Cập nhật giá trị tìm kiếm neu khong phai category
    setPage(1)
    setAllProducts([])
  }, 500), []);  // Delay 500ms sau khi người dùng ngừng nhập

  return (
    <section className="pt-5">
      <div className="container !text-center">
        <div className="flex justify-center p-4 bg-gray-100">
          {' '}
          {/* Thêm nền cho dễ nhìn */}
          <Breadcrumbs aria-label="breadcrumb">
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
            {getCategory ? <Typography sx={{ color: 'text.primary' }}>{getCategory?.type}</Typography> : ""}
          </Breadcrumbs>
        </div>
        <h3 className="font-bold text-black text-[30px] mt-4">{getCategory ? (
          `${getCategory.type.toUpperCase()} COLLECTION`
        ) : "ALL COLLECTION"}</h3>
      </div>
      <div className="bg-white p-2 mt-4">
        <div className="flexProductPage container flex gap-3">
          <div className="slidebarWrapper hidden md:block sm:w-[100%] md:w-[40%] xl:w-[20%] h-full bg-white">
            <SlideBar categoryListZustand={categoryListZustand} selectedCate={selectedCateParams} onCategorySelect={handleChangeCategory} />
            {/*<FilterProduct perPage={perPage} setPerPage={setPerPage} />*/}
          </div>
          <div className="rightContent w-[100%] xl:w-[80%]">
            <div className="bg-[#f1f1f1] p-2 w-full mb-3 rounded-md flex items-center justify-between">
              <div className="col1 flex items-center gap-1 itemViewActions">
                <Button
                  className={`md:!hidden !w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] ${openFilterProduct === true && 'active'
                    }`}
                  onClick={() => setOpenFilterProduct(true)}
                >
                  <FaFilter className="text-[rgba(0,0,0,0.7)]" />
                </Button>
                <Button
                  className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] ${itemView === 'grid' && 'active'
                    }`}
                  onClick={() => setItemView('grid')}
                >
                  <IoGridSharp className="text-[rgba(0,0,0,0.7)]" />
                </Button>
                <Button
                  className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] ${itemView === 'list' && 'active'
                    }`}
                  onClick={() => setItemView('list')}
                >
                  <LuMenu />
                </Button>
              </div>
              <div className="col2 ml-auto flex items-center gap-3 pr-4 justify-end">
                {/* <span className="text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]">Sort By</span>
                <Button
                  id="basic-button"
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                  className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 !border-[#000]"
                >
                  Featured &nbsp; &nbsp;
                  <FaAngleDown />
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={handleClose}>Featured</MenuItem>
                  <MenuItem onClick={handleClose}>Best Selling</MenuItem>
                  <MenuItem onClick={handleClose}>Alphabetically, A-Z</MenuItem>
                  <MenuItem onClick={handleClose}>Alphabetically, Z-A</MenuItem>
                  <MenuItem onClick={handleClose}>Price, low to high</MenuItem>
                  <MenuItem onClick={handleClose}>Price, high to low</MenuItem>
                  <MenuItem onClick={handleClose}>Date, old to new</MenuItem>
                  <MenuItem onClick={handleClose}>Date, new to old</MenuItem>
                </Menu> */}
                {/* Input tìm kiếm */}
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  onChange={handleSearchChange}
                  className="p-2 border rounded"
                />
              </div>
            </div>
            {/* Phần hiển thị */}
            <div className={`grid ${itemView === 'grid' ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {itemView === 'grid' ? (
                <>
                  {Array.isArray(allProducts) && allProducts.length === 0 ? (
                    <p>Không có sản phẩm nào.</p>
                  ) : (
                    allProducts?.map((product) => <ProductItem key={product._id} product={product} />)
                  )}
                </>
              ) : (
                <>
                  {Array.isArray(allProducts) && allProducts.length === 0 ? (
                    <p>Không có sản phẩm nào.</p>
                  ) : (
                    allProducts?.map((product) => <ProductItemListView key={product._id} product={product} normalizeString={normalizeString} />)
                  )}
                </>
              )}
            </div>
            {isLoading ? (
              <div className='flex justify-center'>
                <CircularProgress color="inherit" />
              </div>
            ) : ""}
            <div className="flex w-full items-center justify-center mt-5">
              {isMobile ? (
                hasMore && (
                  <button
                    className="border border-[#b8b8b8] shadow-sm bg-white rounded-md text-black w-full py-2"
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Drawer open={openFilterProduct} onClose={toogleFilterProduct(false)} anchor={'left'} className="filterPanel">
        <FilterProduct perPage={perPage} setPerPage={setPerPage} selectedCate={selectedCateParams} onCategorySelect={handleChangeCategory} />
      </Drawer>
    </section>
  );
};

export default ProductListing;
