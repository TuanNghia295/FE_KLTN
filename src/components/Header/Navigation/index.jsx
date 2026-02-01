import { Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { MdDiscount } from 'react-icons/md';
import CategoryPannel from './CategoryPannel';
import { useState } from 'react';
import '../Navigation/style.css';
import useStore from '../../../store/useStore';
import { normalizeString } from '../../../hook/normalizeString';

const Navigation = () => {
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const toogleCategory = () => setIsOpenCategory(!isOpenCategory);
  // Lấy list Category tu Zustand
  const categoryListZustand = useStore((state) => state.categoryListZustand);
  // const params = normalizeString(categoryListZustand[3]?.type);
  const navigate = useNavigate();
  return (
    <>
      <nav>
        <div className="container flex items-center justify-center gap-8">
          <div className="col_1 hidden xl:block xl:w-[16%]">
            {/* <Button
              className="!text-white gap-2 !bg-black w-full cursor-pointer hover:!bg-gray1"
              onClick={toogleCategory}
            >
              <HiOutlineMenuAlt2 className="text-[18px]" /> Shop by categories
            </Button> */}
          </div>

          {/* Điều hướng chính */}
          <div className="col_2 w-[65%]">
            <ul className="flex items-center justify-center gap nav">
              {['Men', 'Women', 'Children'].map((label) => {
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
                  <li key={label} className="list-none relative">
                    <Link to={`/listing/${categorySlug}`} className="link transition text-[16px] font-[500]">
                      <Button className="link transition font-[500] hover:!text-primary !py-4">{label}</Button>
                    </Link>

                    {subcategories.length > 0 && (
                      <div
                        className="submenu absolute top-[120%] left-[0] min-w-[150px] bg-white shadow-md
                opacity-0  transition-all duration-300"
                      >
                        <ul>
                          {subcategories.map((subcategory) => {
                            const subcategorySlug = normalizeString(subcategory?.type || subcategory?.name);
                            return (
                              <li key={subcategory?.id || subcategorySlug} className="list-none w-full">
                                <Link to={`/listing/${categorySlug}/${subcategorySlug}`}>
                                  <Button className="!text-textPrimary w-full !justify-start !rounded-none">
                                    {subcategory?.name || subcategory?.type}
                                  </Button>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="col_3 hidden xl:block xl:w-[15%] flex items-center justify-end gap-2 ">
            <Button color="error" variant="text" onClick={() => navigate('/my-orders')}>
              <MdDiscount />
              &nbsp;
              <p className="text-[14px] font-[500] text-primary">Order Tracking</p>
            </Button>
          </div>
        </div>
      </nav>

      <CategoryPannel
        categoryListZustand={categoryListZustand}
        isOpenCategory={isOpenCategory}
        toogleCategory={toogleCategory}
      />
    </>
  );
};

export default Navigation;
