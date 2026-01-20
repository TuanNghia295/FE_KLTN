import { useState, useEffect } from 'react';
import { Button, FormControlLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import '../SlideBar/style.css';
import { Collapse } from 'react-collapse';
import { FaAngleDown } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa';
import 'react-range-slider-input/dist/style.css';
import PropTypes from 'prop-types';

const SlideBar = ({ categoryListZustand, selectedCate, onCategorySelect, minPrice, maxPrice, onPriceChange }) => {
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

  const renderCategory = (category, isSubcategory = false, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isChecked = selectedCate === category.id;

    return (
      <div key={category.id} className="w-full">
        <div
          className={`
            flex items-center justify-between w-full
            ${isSubcategory ? 'pl-4 md:pl-6' : ''}
            ${isChecked ? 'bg-gray-100 rounded-md' : ''}
            hover:bg-gray-50 transition-colors
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
                onChange={() => onCategorySelect(category.name)}
                sx={{
                  padding: '4px',
                  '& .MuiSvgIcon-root': { fontSize: isSubcategory ? 16 : 18 },
                }}
              />
            }
            label={
              <span
                className={`
                  ${isSubcategory ? 'text-[13px] md:text-sm text-gray-700' : 'text-sm md:text-base text-black font-medium'}
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

  return (
    <aside className="slidebar w-full">
      {/* Category Filter */}
      <div className="box mb-3 md:mb-4">
        <h1 className="flex mb-2 md:mb-3 !text-black text-[14px] md:text-[16px] font-[600] items-center">
          Category
          <Button
            className="!text-black !ml-auto !min-w-[30px] !p-1"
            onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
          >
            {isOpenCategoryFilter === true ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h1>
        <Collapse isOpened={isOpenCategoryFilter}>
          <div className="scroll max-h-[180px] sm:max-h-[200px] md:max-h-[250px] lg:max-h-[300px] relative overflow-y-auto">
            {Array.isArray(categoryListZustand) && categoryListZustand?.length > 0 ? (
              categoryListZustand?.map((category) => renderCategory(category))
            ) : (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
          </div>
        </Collapse>
      </div>

      {/* Availability Filter */}
      {/* <div className="box mb-3 md:mb-4">
        <h1 className="flex mb-2 md:mb-3 !text-black text-[14px] md:text-[16px] font-[600] items-center">
          Availability
          <Button
            className="!text-black !ml-auto !min-w-[30px] !p-1"
            onClick={() => setIsOpenAvailFilter(!isOpenAvailFilter)}
          >
            {isOpenAvailFilter === true ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h1>
        <Collapse isOpened={isOpenAvailFilter}>
          <div className="scroll max-h-[180px] sm:max-h-[200px] md:max-h-[250px] relative overflow-y-auto">
            <FormControlLabel
              className="w-full !text-sm md:!text-base"
              control={<Checkbox size="small" />}
              label="Available (17)"
            />
            <FormControlLabel
              className="w-full !text-sm md:!text-base"
              control={<Checkbox size="small" />}
              label="In Stock (15)"
            />
            <FormControlLabel
              className="w-full !text-sm md:!text-base"
              control={<Checkbox size="small" />}
              label="Not Available (1)"
            />
          </div>
        </Collapse>
      </div> */}

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
  selectedCate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCategorySelect: PropTypes.func.isRequired,
  minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPriceChange: PropTypes.func,
};

export default SlideBar;
