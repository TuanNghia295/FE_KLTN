/**
 * useParentChildCategories.js
 *
 * Custom hook to manage parent-child category selection with:
 * - Auto-select parent when child is selected
 * - Optional cascade uncheck
 * - Partial selection support
 * - Indeterminate state
 * - No infinite loops
 */

import { useCallback } from 'react';

/**
 * Hook to manage parent-child category selection
 *
 * @param {Array} selectedCategories - Array of selected category IDs
 * @param {Function} onCategoryToggle - Callback when category is toggled
 * @param {Array} categoryListZustand - Full category tree
 * @returns {Object} - Handlers and selectors for parent-child logic
 */
export const useParentChildCategories = (selectedCategories = [], onCategoryToggle, categoryListZustand = []) => {
  /**
   * HELPER: Find category by ID in tree structure (recursively)
   */
  const findCategoryById = useCallback(
    (id, categories = categoryListZustand) => {
      for (const category of categories) {
        if (category.id === id) {
          return category;
        }
        if (category.children && category.children.length > 0) {
          const found = findCategoryById(id, category.children);
          if (found) return found;
        }
      }
      return null;
    },
    [categoryListZustand]
  );

  /**
   * HELPER: Get all descendant IDs (children, grandchildren, etc.)
   * Returns: Array of all descendant category IDs
   */
  const getAllDescendants = useCallback((category) => {
    const descendants = [];

    if (!category || !category.children || category.children.length === 0) {
      return descendants;
    }

    category.children.forEach((child) => {
      descendants.push(child.id);
      // Recursively get grandchildren and beyond
      descendants.push(...getAllDescendants(child));
    });

    return descendants;
  }, []);

  /**
   * HELPER: Get all ancestor IDs (parent, grandparent, etc.)
   * Returns: Array of all ancestor category IDs
   */
  const getAllAncestors = useCallback(
    (categoryId) => {
      const ancestors = [];

      const findAncestors = (id, categories, depth = 0) => {
        for (const category of categories) {
          // Check if current category has the ID as a child
          if (category.children?.some((child) => child.id === id)) {
            ancestors.push(category.id);
            console.log(`🏠 [getAllAncestors] Found parent: ${category.id} for child: ${id} at depth ${depth}`);
            // Recursively find ancestors of this parent from root
            findAncestors(category.id, categoryListZustand, depth + 1);
            return;
          }
          // Recursively search in children
          if (category.children && category.children.length > 0) {
            findAncestors(id, category.children, depth + 1);
          }
        }
      };

      findAncestors(categoryId, categoryListZustand);
      //   console.log(`🏠 [getAllAncestors] For categoryId: ${categoryId}, found ancestors:`, ancestors);
      return ancestors;
    },
    [categoryListZustand]
  );

  /**
   * HELPER: Find direct parent of a category
   */
  const findParentCategory = useCallback(
    (categoryId, categories = categoryListZustand, parentCategory = null) => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return parentCategory;
        }
        if (category.children && category.children.length > 0) {
          const result = findParentCategory(categoryId, category.children, category);
          if (result !== null || (result === null && parentCategory)) {
            return result;
          }
        }
      }
      return null;
    },
    [categoryListZustand]
  );

  /**
   * HELPER: Get count of selected children (direct + indirect)
   */
  const getSelectedChildCount = useCallback(
    (category) => {
      if (!category || !category.children || category.children.length === 0) {
        return 0;
      }

      let count = 0;
      const countDescendants = (cat) => {
        if (!cat || !cat.children) return;

        cat.children.forEach((child) => {
          if (selectedCategories.includes(child.id)) {
            count++;
          }
          countDescendants(child);
        });
      };

      countDescendants(category);
      return count;
    },
    [selectedCategories]
  );

  /**
   * HELPER: Get total count of all children (direct + indirect)
   */
  const getTotalChildCount = useCallback((category) => {
    if (!category || !category.children || category.children.length === 0) {
      return 0;
    }

    let count = 0;
    const countDescendants = (cat) => {
      if (!cat || !cat.children) return;

      cat.children.forEach((child) => {
        count++;
        countDescendants(child);
      });
    };

    countDescendants(category);
    return count;
  }, []);

  /**
   * HELPER: Check if category or any of its descendants are selected
   */
  const hasSelectedChild = useCallback(
    (category) => {
      if (!category || !category.children || category.children.length === 0) {
        return false;
      }

      return category.children.some((child) => {
        if (selectedCategories.includes(child.id)) {
          return true;
        }
        return hasSelectedChild(child);
      });
    },
    [selectedCategories]
  );

  /**
   * HELPER: Check if category has any directly selected children (not grandchildren)
   */
  const hasDirectSelectedChild = useCallback(
    (category) => {
      if (!category || !category.children || category.children.length === 0) {
        return false;
      }
      return category.children.some((child) => selectedCategories.includes(child.id));
    },
    [selectedCategories]
  );

  /**
   * MAIN: Determine checkbox state (checked, unchecked, indeterminate)
   *
   * Returns: {
   *   checked: boolean,
   *   indeterminate: boolean,
   *   display: string ('unchecked' | 'all_children_checked' | 'some_children_checked' | 'normal')
   * }
   */
  const getCheckboxState = useCallback(
    (category) => {
      const isDirectlySelected = selectedCategories.includes(category.id);

      if (!category || !category.children || category.children.length === 0) {
        // Leaf node (no children) - simple checked/unchecked
        return {
          checked: isDirectlySelected,
          indeterminate: false,
          display: isDirectlySelected ? 'checked' : 'unchecked',
        };
      }

      const selectedCount = getSelectedChildCount(category);
      const totalCount = getTotalChildCount(category);

      // No children selected
      if (selectedCount === 0) {
        return {
          checked: isDirectlySelected,
          indeterminate: false,
          display: isDirectlySelected ? 'checked' : 'unchecked',
        };
      }

      // All children selected
      if (selectedCount === totalCount && totalCount > 0) {
        return {
          checked: true,
          indeterminate: false,
          display: 'all_children_checked',
        };
      }

      // Some children selected (INDETERMINATE)
      return {
        checked: true, // Display as checked
        indeterminate: true, // But with indeterminate indicator
        display: 'some_children_checked',
      };
    },
    [selectedCategories, getSelectedChildCount, getTotalChildCount]
  );

  /**
   * MAIN HANDLER: Toggle category with parent-child logic
   *
   * Logic:
   * 1. If checking a child: Also check all ancestors (parents)
   * 2. If unchecking parent: Keep children checked (standard approach)
   *    - Set cascadeUncheck=true to uncheck all children instead
   * 3. If unchecking child: Keep parent checked
   *
   * @param {string} categoryId - The category to toggle
   * @param {Object} options - Optional configuration
   * @param {boolean} options.cascadeUncheck - If true, unchecking parent unchecks all children
   * @returns {Array} - New selection array
   */
  const handleCategoryToggle = useCallback(
    (categoryId, options = {}) => {
      const { cascadeUncheck = false } = options;

      const newSelection = new Set(selectedCategories);
      const isCurrentlySelected = newSelection.has(categoryId);

      //   console.log(`🎯 [handleCategoryToggle] Called for: ${categoryId}, isCurrently: ${isCurrentlySelected}`);

      if (isCurrentlySelected) {
        // ========== UNCHECKING ==========
        // console.log(`❌ [handleCategoryToggle] UNCHECKING: ${categoryId}`);
        newSelection.delete(categoryId);

        // OPTION 1: Cascade uncheck (uncheck all descendants)
        if (cascadeUncheck) {
          const category = findCategoryById(categoryId);
          if (category) {
            const descendants = getAllDescendants(category);
            descendants.forEach((id) => newSelection.delete(id));
          }
        }
        // OPTION 2: No cascade (children remain checked) - DEFAULT
        // No additional action needed
      } else {
        // ========== CHECKING ==========
        // console.log(`✅ [handleCategoryToggle] CHECKING: ${categoryId}`);
        newSelection.add(categoryId);

        const category = findCategoryById(categoryId);
        const isParent = category?.children && category.children.length > 0;

        // console.log(
        //   `🔍 [handleCategoryToggle] Category: ${categoryId}, isParent: ${isParent}, children: ${category?.children?.length || 0}`
        // );

        // If checking a child: auto-select all ancestors
        if (!isParent) {
          //   console.log(`👨‍👧 [handleCategoryToggle] Fetching ancestors for child: ${categoryId}`);
          const ancestors = getAllAncestors(categoryId);
          //   console.log(`👨‍👧 [handleCategoryToggle] Got ancestors: ${ancestors.join(', ')}`);
          ancestors.forEach((ancestorId) => {
            // console.log(`➕ [handleCategoryToggle] Adding ancestor: ${ancestorId}`);
            newSelection.add(ancestorId);
          });
        }
      }

      const result = Array.from(newSelection);
      //   console.log(`📊 [handleCategoryToggle] Final result:`, result);
      return result;
    },
    [selectedCategories, findCategoryById, getAllDescendants, getAllAncestors]
  );

  /**
   * HANDLER: Toggle with cascade options
   * More explicit version for use in components
   */
  const toggleWithLogic = useCallback(
    (categoryId, shouldCascade = false) => {
      const newSelection = handleCategoryToggle(categoryId, {
        cascadeUncheck: shouldCascade,
      });
      return newSelection;
    },
    [handleCategoryToggle]
  );

  return {
    // Main toggle handler
    handleCategoryToggle,
    toggleWithLogic,

    // State determination
    getCheckboxState,

    // Checks for children
    hasSelectedChild,
    hasDirectSelectedChild,
    getSelectedChildCount,
    getTotalChildCount,

    // Tree navigation
    findCategoryById,
    findParentCategory,
    getAllDescendants,
    getAllAncestors,
  };
};

export default useParentChildCategories;
