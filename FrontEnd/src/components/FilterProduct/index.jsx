import React from 'react'
import useStore from '../../store/useStore';
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaFilter } from "react-icons/fa";

const normalizeString = (str) => {
  if (!str) return "";
  return str
    .normalize('NFD')                   // tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '')    // xóa dấu
    .toLowerCase()                      // chuyển về thường
    .replace(/\s+/g, '-')               // thay khoảng trắng = dấu gạch ngang nếu cần
};

const FilterProduct = ({perPage, setPerPage}) => {
  const location = useLocation();
  const currentPath = location.pathname; // ví dụ: "/listing/nam"
  const setOpenFilterProduct = useStore((state) => state.setOpenFilterProduct);
  const categoryListZustand = useStore((state) => state.categoryListZustand);

  const handleChange = (e) => {
    const value = e.target.value;
    setPerPage(value)
  }

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 border-b border-[#f1f1f1]">
        <div className="font-[500] text-[18px] flex items-center gap-3">
          <FaFilter />
          <p className='text-[20px]'>Filter</p>
        </div>
        <IoCloseSharp className="text-[20px] cursor-pointer" onClick={() => setOpenFilterProduct(false)} />
      </div>
      <div className='category w-[300px] p-4'>
        {/* Filter PerPage */}
        <div className='filterPerPage flex justify-between py-4 items-center'>
          <div>
            <h1 className='font-[300] text-[18px] mb-2'>Filter</h1>
          </div>
          <div className="-mt-2">
            <select className='bg-[#f1f1f1] h-[35px] px-4 rounded-md' value={perPage} onChange={handleChange}>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
            </select>
          </div>
        </div>
        {/* List Category */}
        <h1 className='font-[300] text-[18px] mb-2'>Category</h1>
        <ul className='flex flex-col gap-3'>
          {Array.isArray(categoryListZustand) && categoryListZustand.length > 0 && categoryListZustand.map((category, index) => {
            const normalizedType = normalizeString(category?.type);
            const isActive = currentPath === `/listing/${normalizedType}`;
            const nextPath = isActive ? '/listing' : `/listing/${normalizedType}`;

            return (
              <Link to={nextPath} key={index}>
                <li className={`p-2 rounded-md shadow-sm ${isActive ? 'text-white bg-[#494949]' : 'bg-[#f1f1f1]'}`}>{category?.type}</li>
              </Link>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default FilterProduct