import React, { useEffect, useState } from 'react';
import SlideBar from '../../components/SlideBar';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
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
import { useProducts } from '../../services/productsService';

const ProductListing = () => {
  const { productList } = useProducts();
  const [itemView, setItemView] = useState('grid');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <section className="pt-5">
      <div className="container !text-center">
        <Breadcrumbs className="flex w-full justify-center" aria-label="breadcrumb">
          <Link underline="hover" color="inherit" to="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" to="/productListing">
            ProductListing
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Breadcrumbs</Typography>
        </Breadcrumbs>
        <h3 className="font-bold text-black text-[30px] mt-4">ALL COLLECTION</h3>
      </div>
      <div className="bg-white p-2 mt-4">
        <div className="flexProductPage container flex gap-3">
          <div className="slidebarWrapper hidden md:block sm:w-[100%] md:w-[40%] xl:w-[20%] h-full bg-white">
            <SlideBar />
          </div>
          <div className="rightContent w-[100%] xl:w-[80%]">
            <div className="bg-[#f1f1f1] p-2 w-full mb-3 rounded-md flex items-center justify-between">
              <div className="col1 flex items-center gap-1 itemViewActions">
                <Button
                  className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] ${
                    itemView === 'grid' && 'active'
                  }`}
                  onClick={() => setItemView('grid')}
                >
                  <IoGridSharp className="text-[rgba(0,0,0,0.7)]" />
                </Button>
                <Button
                  className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] ${
                    itemView === 'list' && 'active'
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
                  {Array.isArray(productList) && productList.length === 0 ? (
                    <p>Không có sản phẩm nào.</p>
                  ) : (
                    productList.map((product) => <ProductItem key={product._id} product={product} />)
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
