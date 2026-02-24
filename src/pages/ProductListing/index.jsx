import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Drawer from '@mui/material/Drawer';
import SlideBar from '../../components/SlideBar/SlideBar-with-parent-child';
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
import debounce from 'lodash.debounce';

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
};

const ProductListing = () => {
  const { categoryName, category, subcategory } = useParams();
  const categoryListZustand = useStore((state) => state.categoryListZustand);
  const openFilterProduct = useStore((state) => state.openFilterProduct);
  const setOpenFilterProduct = useStore((state) => state.setOpenFilterProduct);

  const toogleFilterProduct = (newOpen) => () => {
    setOpenFilterProduct(newOpen);
  };

  // FIX #3: Add debug logging for state synchronization
  // Uncomment these logs for debugging state mismatch issues
  const categoryParam = categoryName || category || '';

  // Log URL params
  if (categoryListZustand.length > 0) {
    // // console.log('🔍 [ProductListing] URL Params:', {
    //   categoryName,
    //   category,
    //   subcategory,
    //   categoryParam,
    //   categoryListLength: categoryListZustand.length,
    // });
    // FIX #4: Verify category normalization matches
    // Log all available categories with their normalized names for debugging
    // console.log(
    //   '📋 [Available Categories]',
    //   categoryListZustand.map((c) => ({
    //     id: c.id,
    //     name: c.name,
    //     type: c.type,
    //     normalized_name: normalizeString(c.name),
    //     normalized_type: normalizeString(c.type),
    //     children: c.children?.map((ch) => ({
    //       id: ch.id,
    //       name: ch.name,
    //       type: ch.type,
    //       normalized_name: normalizeString(ch.name),
    //     })),
    //   }))
    // );
    // console.log('🔎 [Search Criteria]', {
    //   looking_for_category: categoryParam,
    //   normalized: normalizeString(categoryParam),
    //   looking_for_subcategory: subcategory,
    //   normalized_sub: normalizeString(subcategory),
    // });
  }

  const getCategory = categoryParam
    ? categoryListZustand.find(
        (c) =>
          normalizeString(c.name) === normalizeString(categoryParam) ||
          normalizeString(c.type) === normalizeString(categoryParam)
      )
    : null;

  const getSubcategory = subcategory
    ? getCategory?.children?.find(
        (child) => normalizeString(child?.name || child?.type) === normalizeString(subcategory)
      )
    : null;

  const isMobile = useMediaQuery('(max-width:768px)');
  const [search, setSearch] = useState('');
  const [searchCate, setSearchCate] = useState('');
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  // Sort states
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('');
  const [sortLabel, setSortLabel] = useState('Featured');

  // Price filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // THAY ĐỔI QUAN TRỌNG: Thay vì selectedCateParams là string/number, giờ là array
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { productList, total, loadingProductList } = useProducts(
    perPage,
    page,
    search,
    sortBy,
    sortDir,
    minPrice,
    maxPrice,
    selectedCategories // THAY ĐỔI: Gửi array trực tiếp thay vì string
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

  const totalPage = selectedCategories.length > 0 ? total : getCategory ? totalCate : total;

  // FIX #1: Add categoryListZustand to dependency array
  // This ensures the effect re-runs when categories are loaded from API
  useEffect(() => {
    // Guard: Only sync if we have categories loaded
    if (categoryListZustand.length === 0) {
      // console.log('⏳ Waiting for categories to load...');
      return;
    }

    if (getSubcategory?.id) {
      // console.log('✓ Syncing selectedCategories to subcategory:', getSubcategory.name, getSubcategory.id);
      setSelectedCategories([getSubcategory.id]);
    } else if (getCategory?.id) {
      // console.log('✓ Syncing selectedCategories to category:', getCategory.name, getCategory.id);
      setSelectedCategories([getCategory.id]);
    } else {
      // console.log('✓ Clearing selectedCategories (no category matched)');
      setSelectedCategories([]);
    }
  }, [getCategory?.id, getSubcategory?.id, categoryListZustand.length]);

  const [itemView, setItemView] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [allProducts, setAllProducts] = useState([]);
  const isLoading =
    selectedCategories.length > 0 ? loadingProductList : getCategory ? loadingProductCateList : loadingProductList;
  const hasMore = page < totalPage;

  // ==========================================
  // NEW: Batch update handler for efficient category selection
  // When sub-categories are selected, parent is auto-selected
  // ==========================================
  const handleBatchCategoryUpdate = useCallback((newSelectedCategories) => {
    // console.log('📦 [handleBatchCategoryUpdate] Batch update received:', newSelectedCategories);
    // console.log('📦 [handleBatchCategoryUpdate] Setting state to:', newSelectedCategories);
    setSelectedCategories(newSelectedCategories);
    // useEffect will automatically trigger API call with new selectedCategories
  }, []);

  // Handle Toggle Category (thêm/bỏ category khỏi selection)
  const handleToggleCategory = (categoryId) => {
    // console.log('🔄 [handleToggleCategory] Toggle category:', categoryId);
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // Nếu đã được chọn, bỏ chọn
        const next = prev.filter((id) => id !== categoryId);
        // console.log('  Before:', prev, '→ After (removed):', next);
        return next;
      } else {
        // Nếu chưa được chọn, thêm vào
        const next = [...prev, categoryId];
        // console.log('  Before:', prev, '→ After (added):', next);
        return next;
      }
    });
  };

  // Log state changes for debugging
  useEffect(() => {
    // console.log('📊 [State Change] selectedCategories:', selectedCategories);
  }, [selectedCategories]);

  // ==========================================
  // Helper functions for breadcrumb rendering
  // ==========================================
  const getCategoryNameById = (categoryId) => {
    // Tìm trong categories cấp 1
    let found = categoryListZustand.find((c) => c.id === categoryId);
    if (found) return found.name;

    // Tìm trong sub-categories
    for (const parent of categoryListZustand) {
      if (parent.children && parent.children.length > 0) {
        found = parent.children.find((c) => c.id === categoryId);
        if (found) return found.name;
      }
    }
    return 'Category';
  };

  const getParentCategoryById = (categoryId) => {
    for (const parent of categoryListZustand) {
      if (parent.children && parent.children.length > 0) {
        const child = parent.children.find((c) => c.id === categoryId);
        if (child) return parent;
      }
    }
    return null;
  };

  // Render breadcrumbs based on selected categories or URL params
  const renderBreadcrumbs = () => {
    const breadcrumbs = [
      <RouterLink key="home" to="/" className="hover:underline text-inherit">
        Home Page
      </RouterLink>,
      <RouterLink key="listing" to="/listing" className="hover:underline text-inherit">
        Listing
      </RouterLink>,
    ];

    // If sidebar categories are being filtered, use them
    // This takes precedence over URL params
    if (selectedCategories && selectedCategories.length > 0) {
      // console.log('🥖 [renderBreadcrumbs] Has selected categories, building breadcrumbs');

      // Convert selectedCategories to a Set for fast lookup
      const selectedSet = new Set(selectedCategories);

      // Group categories by parent - only if parent is also selected
      const categoryGroups = {};
      const parentCategories = [];

      selectedCategories.forEach((categoryId) => {
        const categoryName = getCategoryNameById(categoryId);
        const parentCategory = getParentCategoryById(categoryId);

        if (parentCategory && selectedSet.has(parentCategory.id)) {
          // It's a sub-category AND parent is also selected
          if (!categoryGroups[parentCategory.id]) {
            categoryGroups[parentCategory.id] = {
              parent: parentCategory,
              children: [],
            };
            parentCategories.push(parentCategory.id);
          }
          categoryGroups[parentCategory.id].children.push({
            id: categoryId,
            name: categoryName,
          });
        } else if (!parentCategory) {
          // It's a parent category with no selected parent
          if (!categoryGroups[categoryId]) {
            categoryGroups[categoryId] = {
              parent: { id: categoryId, name: categoryName },
              children: [],
            };
            parentCategories.push(categoryId);
          }
        } else {
          // It's a child but parent is NOT selected - show as standalone
          if (!categoryGroups[categoryId]) {
            categoryGroups[categoryId] = {
              parent: { id: categoryId, name: categoryName },
              children: [],
            };
            parentCategories.push(categoryId);
          }
        }
      });

      // console.log('🥖 [renderBreadcrumbs] Category groups:', categoryGroups);

      // Render breadcrumbs for each parent and its children
      parentCategories.forEach((parentId, index) => {
        const group = categoryGroups[parentId];
        const parentName = group.parent.name;

        if (group.children.length > 0) {
          // Has sub-categories, show parent as link and children as text
          breadcrumbs.push(
            <RouterLink
              key={`parent-${parentId}`}
              to={`/listing/${normalizeString(parentName)}`}
              className="hover:underline text-inherit"
            >
              {parentName}
            </RouterLink>
          );

          const childNames = group.children.map((c) => c.name).join(', ');
          breadcrumbs.push(
            <Typography key={`children-${parentId}`} sx={{ color: 'text.primary' }}>
              {childNames}
            </Typography>
          );
        } else {
          // Parent only, no children selected - show as standalone category
          breadcrumbs.push(
            <RouterLink
              key={`parent-only-${parentId}`}
              to={`/listing/${normalizeString(parentName)}`}
              className="hover:underline text-inherit"
            >
              {parentName}
            </RouterLink>
          );
        }
      });
    } else if (!getCategory || !subcategory) {
      // Only show URL-based breadcrumbs if:
      // 1. NO sidebar filtering is happening (selectedCategories is empty)
      // 2. AND there are actual URL params (getCategory exists)
      // 3. AND NOT coming from subcategory URL
      // console.log('🥖 [renderBreadcrumbs] No selected categories, checking URL params');

      if (getCategory && !getSubcategory) {
        breadcrumbs.push(
          <Typography key="category" sx={{ color: 'text.primary' }}>
            {getCategory?.name}
          </Typography>
        );
      } else if (getCategory && getSubcategory) {
        breadcrumbs.push(
          <RouterLink key="parent" to={`/listing/${categoryParam}`} className="hover:underline text-inherit">
            {getCategory?.name}
          </RouterLink>
        );
        breadcrumbs.push(
          <Typography key="child" sx={{ color: 'text.primary' }}>
            {getSubcategory?.name}
          </Typography>
        );
      }
    } else {
      // When all sidebar filters are cleared, don't show breadcrumbs
      // console.log('🥖 [renderBreadcrumbs] All filters cleared, showing only Home > Listing');
    }

    return (
      <Breadcrumbs aria-label="breadcrumb" className="text-xs sm:text-sm">
        {breadcrumbs}
      </Breadcrumbs>
    );
  };

  // Reset sản phẩm khi đổi category, perPage, hoặc filters
  useEffect(() => {
    setAllProducts([]);
    setPage(1);
  }, [categoryParam, subcategory, perPage, isMobile, sortBy, sortDir, minPrice, maxPrice, selectedCategories.length]);

  useEffect(() => {
    let sourceProducts = selectedCategories.length > 0 ? productList : getCategory ? productCateList : productList;

    // Kiểm tra và xử lý sản phẩm
    const newProducts = sourceProducts?.map((product) => {
      // Lấy category_id từ product (có thể là string hoặc object)
      const productCategoryId =
        typeof product?.category_id === 'object'
          ? product?.category_id?._id || product?.category_id?.id
          : product?.category_id;

      // Tìm thông tin category từ categoryListZustand
      const productCategory = categoryListZustand.find(
        (cat) => cat.id === productCategoryId || cat._id === productCategoryId
      );

      // Kiểm tra nếu category có type là 'Sale' hoặc tên là 'Sale'
      const isSaleCategory =
        productCategory?.type === 'Sale' || productCategory?.name === 'Sale' || productCategoryId === 'Sale';

      if (isSaleCategory) {
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
  }, [productList, productCateList, isMobile, search, getCategory, selectedCategories, categoryListZustand]);

  const handleSearchChange = useMemo(
    () =>
      debounce((e) => {
        setSearch(e.target.value);
        setSearchCate(e.target.value);
        setPage(1);
        setAllProducts([]);
      }, 500),
    []
  );

  const handleSort = (label, field, direction) => {
    setSortLabel(label);
    setSortBy(field);
    setSortDir(direction);
    setPage(1);
    setAllProducts([]);
    handleClose();
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
    setAllProducts([]);
  };

  // FIX #2: Show loading state while categories are being fetched
  // This prevents UI mismatches when breadcrumbs show but filters haven't synced yet
  if (categoryListZustand.length === 0) {
    return (
      <section className="pt-3 sm:pt-5">
        <div className="container !text-center">
          <div className="flex justify-center items-center py-20">
            <CircularProgress />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-3 sm:pt-5">
      <div className="container !text-center">
        <div className="flex justify-center p-3 sm:p-4 bg-gray-100 rounded-md">{renderBreadcrumbs()}</div>
        <h3 className="font-bold text-black text-[20px] sm:text-[24px] md:text-[30px] mt-3 sm:mt-4 px-2">
          {selectedCategories.length > 0
            ? `FILTERED COLLECTION (${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'})`
            : getSubcategory
              ? `${getSubcategory?.name?.toUpperCase()} COLLECTION`
              : getCategory
                ? `${getCategory.name.toUpperCase()} COLLECTION`
                : 'ALL COLLECTION'}
        </h3>
      </div>
      <div className="bg-white p-2 sm:p-3 mt-3 sm:mt-4">
        <div className="flexProductPage container flex flex-col md:flex-row gap-3">
          <div className="slidebarWrapper hidden md:block sm:w-[100%] md:w-[40%] xl:w-[20%] h-full bg-white">
            <SlideBar
              categoryListZustand={categoryListZustand}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleToggleCategory}
              onBatchUpdate={handleBatchCategoryUpdate}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
            />
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
                <input
                  type="text"
                  placeholder="Search products..."
                  onChange={handleSearchChange}
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:border-[#494949] focus:ring-1 focus:ring-[#494949] w-full sm:w-auto sm:min-w-[200px]"
                />
              </div>
            </div>

            {/* Hiển thị các category đã chọn */}
            {selectedCategories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedCategories.map((catId) => {
                  const category = categoryListZustand.find((c) => c.id === catId);
                  return category ? (
                    <div key={catId} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <span>{category.name}</span>
                      <button onClick={() => handleToggleCategory(catId)} className="text-gray-600 hover:text-black">
                        ✕
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

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
          selectedCategories={selectedCategories}
          onCategoryToggle={handleToggleCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
        />
      </Drawer>
    </section>
  );
};

export default ProductListing;
