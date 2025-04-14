import { useState } from 'react';
import './style.css';
import Button from '@mui/material/Button';
import { IoIosSearch } from 'react-icons/io';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);

  const [keyword, setKeyword] = useState('')
  const navigate =  useNavigate()

  const handleChange = (e) => {
    setKeyword(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn load lại trang
    navigate(`/search?keyword=${keyword}`)
    setKeyword('')
  }

  return (
    <>
      {/* Nút tìm kiếm hiển thị trên desktop */}
      <form className="searchBox w-[100%] h-[50px] bg-inherit xl:bg-[#f1f1f1] rounded-[32px] relative p-2 px-4 hidden xl:flex" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={keyword}
          onChange={handleChange}
          className="w-full h-[36px] focus:outline-none bg-none bg-inherit p-2 text-[15px]"
        />
        <Button className="xl:flex xl:justify-center xl:!absolute xl:top-[8px] xl:right-[4px] z-10 xl:!w-[42px] xl:!min-w-[36px] xl:h-[36px] p-0 xl:!rounded-full xl:!text-[#f5f5f5]">
          <IoIosSearch color="#000" className="text-red-700 text-[20px]" />
        </Button>
      </form>

      {/* Nút tìm kiếm trên mobile */}
      <button className="xl:hidden p-2" onClick={() => setIsOpen(true)}>
        <IoIosSearch className="text-[24px] text-black" />
      </button>

      {/* Modal tìm kiếm trên mobile */}
      {isOpen && (
        <form
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-start z-50"
          onClick={() => setIsOpen(false)} // Đóng modal khi nhấn ra ngoài
          onSubmit={handleSubmit}
        >
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white p-4 rounded-b-xl shadow-lg flex flex-col relative"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan ra ngoài
          >
            {/* Ô nhập tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={keyword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg"
            />
          </motion.div>
        </form>
      )}
    </>
  );
}
