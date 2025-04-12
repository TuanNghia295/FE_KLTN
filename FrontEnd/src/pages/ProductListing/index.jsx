import React, { useEffect, useState } from 'react';
import SlideBar from '../../components/SlideBar';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink, useParams } from 'react-router-dom';
import '../ProductListing/style.css';
import ProductItem from '../../components/ProductItem';
import ProductItemListView from '../../components/ProductItemListView';
import { IoGridSharp } from 'react-icons/io5';
import { LuMenu } from 'react-icons/lu';
import { Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FaAngleDown } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';
import { useProducts, useProductsCategory } from '../../services/productsService';
import useStore from '../../store/useStore'

const normalizeString = (str) => {
  return str
    .normalize('NFD')                   // tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '')    // xóa dấu
    .toLowerCase()                      // chuyển về thường
    .replace(/\s+/g, '-')               // thay khoảng trắng = dấu gạch ngang nếu cần
};

const ProductListing = () => {
  const { categoryName } = useParams(); // 'men', 'women', v.v.
  const [selectedCategory, setSelectedCategory] = useState(null)
  // Lấy list Category tu Zustand
  const categoryListZustand = useStore((state) => state.categoryListZustand);

  const getCategory = categoryName
    ? categoryListZustand.find(
      (c) => normalizeString(c.type) === normalizeString(categoryName)
    )
    : null;



  const { productList } = useProducts();
  const { productCateList } = useProductsCategory(selectedCategory || getCategory?._id);


  const [itemView, setItemView] = useState('grid');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Quyết định gọi API nào (theo trạng thái selectedCategories)
  const productData = selectedCategory || getCategory ? productCateList : productList

  // Callback khi chọn category từ SlideBar
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

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
            {/* Bạn có thể thêm link Category ở đây nếu có */}
            {/* <RouterLink to={`/category/${productDetail.categoryId?._id}`} className="hover:underline text-inherit">
            {productDetail.categoryId?.type || 'Category'}
          </RouterLink> */}
            <Typography sx={{ color: 'text.primary' }}>{getCategory?.type}</Typography>
          </Breadcrumbs>
        </div>
        <h3 className="font-bold text-black text-[30px] mt-4">{getCategory ? (
          `${getCategory.type.toUpperCase()} COLLECTION`
        ) : "ALL COLLECTION"}</h3>
      </div>
      <div className="bg-white p-2 mt-4">
        <div className="flexProductPage container flex gap-3">
          <div className="slidebarWrapper hidden md:block sm:w-[100%] md:w-[40%] xl:w-[20%] h-full bg-white">
            <SlideBar categoryListZustand={categoryListZustand} onCategorySelect={handleCategorySelect} />
          </div>
          <div className="rightContent w-[100%] xl:w-[80%]">
            <div className="bg-[#f1f1f1] p-2 w-full mb-3 rounded-md flex items-center justify-between">
              <div className="col1 flex items-center gap-1 itemViewActions">
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
                <span className="text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]">Sort By</span>
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
                </Menu>
              </div>
            </div>
            <div className={`grid ${itemView === 'grid' ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {itemView === 'grid' ? (
                <>
                  {Array.isArray(productData) && productData.length === 0 ? (
                    <p>Không có sản phẩm nào.</p>
                  ) : (
                    productData?.map((product) => <ProductItem key={product._id} product={product} />)
                  )}
                </>
              ) : (
                <>
                  <ProductItemListView />
                </>
              )}
            </div>

            <div className="flex w-full items-center justify-center mt-3">
              <Pagination count={10} showFirstButton showLastButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListing;
