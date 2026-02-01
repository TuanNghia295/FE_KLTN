import { Button } from '@mui/material';
import { useState } from 'react';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { normalizeString } from '../../hook/normalizeString';

export default function CategoryCollapse({ categoryListZustand }) {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [innerSubmenuIndex, setInnerSubmenuIndex] = useState(null);
  // Hàm đóng mở submenu
  const openSubmenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };
  // Hàm đóng mở inner submenu
  const openInnerSubmenu = (index) => {
    if (innerSubmenuIndex === index) {
      setInnerSubmenuIndex(null);
    } else {
      setInnerSubmenuIndex(index);
    }
  };

  return (
    <>
      <div className="scroll">
        <ul className="w-full">
          {['Men', 'Women', 'Children'].map((label, index) => {
            const normalizedLabel = normalizeString(label);
            const matchedCategory = Array.isArray(categoryListZustand)
              ? categoryListZustand.find((category) => {
                  const normalizedName = normalizeString(category?.name);
                  const normalizedType = normalizeString(category?.type);
                  return normalizedName === normalizedLabel || normalizedType === normalizedLabel;
                })
              : null;
            const categorySlug = normalizeString(matchedCategory?.type || matchedCategory?.name || label);
            const subcategories = Array.isArray(matchedCategory?.children) ? matchedCategory.children : [];

            return (
              <li key={label} className="list-none flex items-center relative flex-col">
                <Link to={`/listing/${categorySlug}`} className="w-full">
                  <Button className="w-full !text-left !justify-start !px-3 !text-textPrimary  hover:!bg-grayf5">
                    {label}
                  </Button>
                </Link>
                {submenuIndex === index ? (
                  <CiSquareMinus
                    className="absolute top-[8px] right-[15px] text-[20px] cursor-pointer"
                    onClick={() => openSubmenu(index)}
                  />
                ) : (
                  <CiSquarePlus
                    className="absolute top-[8px] right-[15px] text-[20px] cursor-pointer"
                    onClick={() => openSubmenu(index)}
                  />
                )}

                {submenuIndex === index && subcategories.length > 0 && (
                  <ul className="inner_submenu  w-full pl-3 ">
                    {subcategories.map((subcategory) => {
                      const subcategorySlug = normalizeString(subcategory?.type || subcategory?.name);
                      return (
                        <li key={subcategory?.id || subcategorySlug} className="list-none relative">
                          <Link
                            to={`/listing/${categorySlug}/${subcategorySlug}`}
                            className="!hover:!text-primary !transition"
                          >
                            <Button className="w-full hover:!bg-grayf5 !text-left !justify-start !px-3 !text-textPrimary">
                              {subcategory?.name || subcategory?.type}
                            </Button>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
