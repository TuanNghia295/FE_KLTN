import React from 'react';
import useStore from '../../store/useStore';
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import useMediaQuery from '@mui/material/useMediaQuery';
import SlideBar from '../SlideBar/index';

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD') // tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // xóa dấu
    .toLowerCase() // chuyển về thường
    .replace(/\s+/g, '-'); // thay khoảng trắng = dấu gạch ngang nếu cần
};

const FilterProduct = ({
  perPage,
  setPerPage,
  selectedCategories, // THAY ĐỔI: từ selectedCate thành selectedCategories
  onCategoryToggle, // THAY ĐỔI: từ onCategorySelect thành onCategoryToggle
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const location = useLocation();
  const currentPath = location.pathname; // ví dụ: "/listing/nam"
  const setOpenFilterProduct = useStore((state) => state.setOpenFilterProduct);
  const categoryListZustand = useStore((state) => state.categoryListZustand);

  const handleChange = (e) => {
    const value = e.target.value;
    setPerPage(value);
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 border-b border-[#f1f1f1]">
        <div className="font-[500] text-[18px] flex items-center gap-3">
          <FaFilter />
          <p className="text-[20px]">Filter</p>
        </div>
        <IoCloseSharp className="text-[20px] cursor-pointer" onClick={() => setOpenFilterProduct(false)} />
      </div>
      <div className="category w-[300px] p-4">
        {/* List Category */}
        <ul className="flex flex-col gap-3"></ul>
        <SlideBar
          categoryListZustand={categoryListZustand}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={onPriceChange}
        />
      </div>
    </>
  );
};

export default FilterProduct;
