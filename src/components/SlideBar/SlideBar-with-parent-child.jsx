/**
 * SlideBar Component - Updated with Parent-Child Category Logic
 *
 * Features:
 * - Auto-select parent when child is selected
 * - Partial selection support with indeterminate state
 * - Clean event handling without infinite loops
 * - Backward compatible with existing props
 */

import { useState, useEffect, useCallback } from 'react';
import { Button, FormControlLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import '../SlideBar/style.css';
import { Collapse } from 'react-collapse';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import 'react-range-slider-input/dist/style.css';
import PropTypes from 'prop-types';
import { useParentChildCategories } from '../../hooks/useParentChildCategories';

const SlideBar = ({
  categoryListZustand,
  selectedCategories = [],
  onCategoryToggle, // Single toggle (backward compatible)
  onBatchUpdate, // NEW: Batch update callback (recommended)
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);

  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '');

  // State for expand/collapse categories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Sync local price state with props
  useEffect(() => {
    setLocalMinPrice(minPrice || '');
    setLocalMaxPrice(maxPrice || '');
  }, [minPrice, maxPrice]);

  // Initialize parent-child logic
  const parentChildLogic = useParentChildCategories(selectedCategories, onCategoryToggle, categoryListZustand);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Toggle category with parent-child logic
   *
   * Logic:
   * 1. Checking a child → automatically checks all ancestors
   * 2. Unchecking a parent → children stay checked (standard approach)
   * 3. Checking a parent → children don't automatically get checked
   */
  const handleCategoryToggle = useCallback(
    (categoryId) => {
      //   console.log(`🎪 [SlideBar.handleCategoryToggle] Toggle clicked: ${categoryId}`);

      const newSelectedCategories = parentChildLogic.handleCategoryToggle(categoryId, {
        cascadeUncheck: false, // Set to true if you want cascade uncheck
      });

      //   console.log(`🎪 [SlideBar.handleCategoryToggle] Got new selection:`, newSelectedCategories);

      // Update parent component
      if (onBatchUpdate) {
        // Recommended: Use batch update for efficiency
        // console.log(`🎪 [SlideBar.handleCategoryToggle] Calling onBatchUpdate`);
        onBatchUpdate(newSelectedCategories);
      } else {
        // Fallback: Call onCategoryToggle for changed items
        // This is less efficient but maintains backward compatibility
        // console.log(`🎪 [SlideBar.handleCategoryToggle] No onBatchUpdate, using fallback`);
        updateViaToggle(newSelectedCategories);
      }
    },
    [parentChildLogic, onBatchUpdate]
  );

  /**
   * Fallback method: Update via individual toggles
   * Used when onBatchUpdate is not provided
   */
  const updateViaToggle = useCallback(
    (newSelectedCategories) => {
      const newSet = new Set(newSelectedCategories);
      const oldSet = new Set(selectedCategories);

      // Remove items that are no longer selected
      oldSet.forEach((id) => {
        if (!newSet.has(id)) {
          onCategoryToggle(id);
        }
      });

      // Add items that are newly selected
      newSet.forEach((id) => {
        if (!oldSet.has(id)) {
          onCategoryToggle(id);
        }
      });
    },
    [selectedCategories, onCategoryToggle]
  );

  /**
   * Toggle category expansion (show/hide children)
   */
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  /**
   * Price filter handlers
   */
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

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  /**
   * Recursively render category tree
   */
  const renderCategory = (category, isSubcategory = false) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];

    // Get checkbox state with parent-child logic
    const checkboxState = parentChildLogic.getCheckboxState(category);
    const { checked: isChecked, indeterminate: isIndeterminate } = checkboxState;

    return (
      <div key={category.id} className="w-full">
        <div
          className={`
            flex items-center justify-between w-full
            ${isSubcategory ? 'pl-4 md:pl-6' : ''}
            ${isChecked ? 'bg-gray-100 border-l-2 border-black' : ''}
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
                indeterminate={isIndeterminate}
                value={category.id}
                onChange={() => handleCategoryToggle(category.id)}
                sx={{
                  padding: '4px',
                  '& .MuiSvgIcon-root': { fontSize: isSubcategory ? 16 : 18 },
                  color: isChecked ? '#3b82f6' : undefined,
                  '&.Mui-checked': {
                    color: 'black',
                  },
                  // Style for indeterminate state (partial selection)
                  '&.MuiCheckbox-indeterminate': {
                    color: '#f59e0b', // Amber color for partial selection
                  },
                }}
              />
            }
            label={
              <span
                className={`
                  ${isSubcategory ? 'text-[13px] md:text-sm text-gray-700' : 'text-sm md:text-base text-black font-medium'}
                  ${isChecked ? 'font-semibold text-neutral-600' : ''}
                  ${isIndeterminate ? 'text-amber-600' : ''}
                `}
              >
                {category.name}
                {/* Visual indicator for indeterminate state */}
                {isIndeterminate && <span className="ml-1 text-amber-600 font-bold">(-)</span>}
              </span>
            }
          />
          {hasChildren && (
            <Button
              size="small"
              className="!min-w-[28px] !h-[28px] !p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpand(category.id);
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

        {/* Render child categories if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-1">{category.children.map((child) => renderCategory(child, true))}</div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  const selectedCount = selectedCategories.length;

  return (
    <aside className="slidebar w-full">
      {/* Category Filter Section */}
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
            {isOpenCategoryFilter ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </h1>

        <Collapse isOpened={isOpenCategoryFilter}>
          {/* Clear all button */}
          {selectedCount > 0 && (
            <div className="mb-2">
              <Button
                onClick={() => {
                  if (onBatchUpdate) {
                    onBatchUpdate([]);
                  } else {
                    selectedCategories.forEach((catId) => onCategoryToggle(catId));
                  }
                }}
                className="!text-xs !text-neutral-600 !underline !p-0 !min-w-0 hover:!text-red-800"
                size="small"
              >
                Clear all ({selectedCount})
              </Button>
            </div>
          )}

          {/* Category list */}
          <div className="scroll max-h-[180px] sm:max-h-[200px] md:max-h-[250px] lg:max-h-[300px] relative overflow-y-auto">
            {Array.isArray(categoryListZustand) && categoryListZustand?.length > 0 ? (
              categoryListZustand?.map((category) => renderCategory(category))
            ) : (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
          </div>
        </Collapse>
      </div>

      {/* Price Filter Section */}
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
  onBatchUpdate: PropTypes.func, // NEW: Optional batch update
  minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPriceChange: PropTypes.func,
};

export default SlideBar;
