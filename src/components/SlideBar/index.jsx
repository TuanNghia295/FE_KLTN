import { useState, useEffect } from 'react';
import { Button, FormControlLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import '../SlideBar/style.css';
import { Collapse } from 'react-collapse';
import { FaAngleDown } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa';
import 'react-range-slider-input/dist/style.css';
import PropTypes from 'prop-types';

const SlideBar = ({
  categoryListZustand,
  selectedCategories = [], // THAY ĐỔI: từ selectedCate thành selectedCategories (array)
  onCategoryToggle, // THAY ĐỔI: từ onCategorySelect thành onCategoryToggle
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);

  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '');

  // Sync local state with props
  useEffect(() => {
    setLocalMinPrice(minPrice || '');
    setLocalMaxPrice(maxPrice || '');
  }, [minPrice, maxPrice]);

  const handleApplyPriceFilter = () => {
    if (onPriceChange) {
      onPriceChange(localMinPrice, localMaxPrice);
    }
  };

  const handleClearPriceFilter = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    if (onPriceChange) {
      onPriceChange('', '');
    }
  };

  // State để quản lý mở/đóng subcategories
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Helper function để kiểm tra xem category hoặc bất kỳ child nào có được chọn không
  const isCategoryOrChildSelected = (category) => {
    if (selectedCategories.includes(category.id)) {
      return true;
    }
    if (category.children && category.children.length > 0) {
      return category.children.some((child) => isCategoryOrChildSelected(child));
    }
    return false;
  };

  const renderCategory = (category, isSubcategory = false, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isChecked = selectedCategories.includes(category.id); // THAY ĐỔI: Kiểm tra có trong array không
    const hasSelectedChild = hasChildren && isCategoryOrChildSelected(category);

    return (
      <div key={category.id} className="w-full">
        <div
          className={`
            flex items-center justify-between w-full
            ${isSubcategory ? 'pl-4 md:pl-6' : ''}
            ${isChecked ? 'bg-gray-100 border-l-2 border-black' : hasSelectedChild ? 'bg-gray-50' : ''}
            hover:bg-gray-100 transition-colors
            py-0.5
          `}
        >
          <FormControlLabel
            className="!m-0 flex-1"
            control={
              <Checkbox
                size="small"
                checked={isChecked}
                value={category.id}
                onChange={() => onCategoryToggle(category.id)} // THAY ĐỔI: Toggle bằng ID
                sx={{
                  padding: '4px',
                  '& .MuiSvgIcon-root': { fontSize: isSubcategory ? 16 : 18 },
                  color: isChecked ? '#3b82f6' : undefined,
                  '&.Mui-checked': {
                    color: 'black',
                  },
                }}
              />
            }
            label={
              <span
                className={`
                  ${isSubcategory ? 'text-[13px] md:text-sm text-gray-700' : 'text-sm md:text-base text-black font-medium'}
                  ${isChecked ? 'font-semibold text-neutral-600' : ''}
                `}
              >
                {category.name}
              </span>
            }
          />
          {hasChildren && (
            <Button
              size="small"
              className="!min-w-[28px] !h-[28px] !p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              {isExpanded ? (
                <FaAngleUp className="text-[12px] text-gray-600" />
              ) : (
                <FaAngleDown className="text-[12px] text-gray-600" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">{category.children.map((child) => renderCategory(child, true, level + 1))}</div>
        )}
      </div>
    );
  };

  // Đếm số lượng category đã chọn
  const selectedCount = selectedCategories.length;

  return (
    <aside className="slidebar w-full">
      {/* Category Filter */}
      <div className="box mb-3 md:mb-4">
        <h1 className="flex mb-2 md:mb-3 !text-black text-[14px] md:text-[16px] font-[600] items-center">
          Category
          {selectedCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{selectedCount}</span>
          )}
          <Button
            className="!text-black !ml-auto !min-w-[30px] !p-1"
            onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
          >
            {isOpenCategoryFilter === true ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h1>
        <Collapse isOpened={isOpenCategoryFilter}>
          {/* Clear all button */}
          {selectedCount > 0 && (
            <div className="mb-2">
              <Button
                onClick={() => {
                  // Clear tất cả selections
                  selectedCategories.forEach((catId) => onCategoryToggle(catId));
                }}
                className="!text-xs !text-neutral-600 !underline !p-0 !min-w-0 hover:!text-red-800"
                size="small"
              >
                Clear all ({selectedCount})
              </Button>
            </div>
          )}
          <div className="scroll max-h-[180px] sm:max-h-[200px] md:max-h-[250px] lg:max-h-[300px] relative overflow-y-auto">
            {Array.isArray(categoryListZustand) && categoryListZustand?.length > 0 ? (
              categoryListZustand?.map((category) => renderCategory(category))
            ) : (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
          </div>
        </Collapse>
      </div>

      {/* Price Filter */}
      <div className="box mb-3 md:mb-4">
        <h1 className="flex mb-2 md:mb-3 !text-black text-[14px] md:text-[16px] font-[600] items-center">
          Price
          <Button
            className="!text-black !ml-auto !min-w-[30px] !p-1"
            onClick={() => setIsOpenPriceFilter(!isOpenPriceFilter)}
          >
            {isOpenPriceFilter === true ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h1>
        <Collapse isOpened={isOpenPriceFilter}>
          <div className="flex flex-col gap-2 md:gap-3">
            <input
              type="number"
              placeholder="Min Price"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="p-2 text-sm md:text-base border border-gray-300 rounded focus:outline-none focus:border-[#494949] focus:ring-1 focus:ring-[#494949] w-full"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="p-2 text-sm md:text-base border border-gray-300 rounded focus:outline-none focus:border-[#494949] focus:ring-1 focus:ring-[#494949] w-full"
            />
            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                onClick={handleApplyPriceFilter}
                className="!bg-[#494949] !text-white !w-full !text-xs md:!text-sm !py-2 hover:!bg-[#333] transition-colors"
                size="small"
              >
                Apply
              </Button>
              <Button
                onClick={handleClearPriceFilter}
                className="!bg-gray-200 !text-black !w-full !text-xs md:!text-sm !py-2 hover:!bg-gray-300 transition-colors"
                size="small"
              >
                Clear
              </Button>
            </div>
          </div>
        </Collapse>
      </div>
    </aside>
  );
};

SlideBar.propTypes = {
  categoryListZustand: PropTypes.array.isRequired,
  selectedCategories: PropTypes.array,
  onCategoryToggle: PropTypes.func.isRequired,
  minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPriceChange: PropTypes.func,
};

export default SlideBar;
