import React from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { CgProfile } from 'react-icons/cg';
import { FaMapLocationDot } from 'react-icons/fa6';
import { MdFavorite } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa';
import { IoIosLogOut } from 'react-icons/io';
import useStore from '../../store/useStore';

const AccountSlidebar = () => {
  // Sử dụng selector để chỉ lấy các trạng thái cần thiết
  const userInfo = useStore((state) => state.userInfo);
  const clearInfo = useStore((state) => state.clearInfo);

  const menuItems = [
    { path: '/my-account', label: 'My Profile', icon: <CgProfile /> },
    { path: '/my-address', label: 'My Address', icon: <FaMapLocationDot /> },
    { path: '/my-list', label: 'My List', icon: <MdFavorite /> },
    { path: '/my-orders', label: 'My Orders', icon: <FaClipboardList /> },
  ];

  const handleLogout = () => {
    clearInfo(); // Xóa thông tin người dùng trong Zustand
    console.log('User logged out');
  };

  return (
    <div className="card bg-white shadow-md rounded-md p-5">
      <div className="w-full p-3 flex items-center justify-center flex-col border-b border-[#f1f1f1] mb-2">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-4 relative">
          <Avatar
            sx={{ width: 100, height: 100 }}
            alt={userInfo ? userInfo.fullName : 'Default'}
            src="https://images.vexels.com/media/users/3/145908/raw/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg"
          />
          <div className="overlay w-full h-full absolute top-0 left-0 z-50 bg-[#000000ab] flex items-center justify-center">
            <FaCloudUploadAlt className="text-[#fff]" />
            <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"></input>
          </div>
        </div>

        <h3 className="text-black text-[20px] font-[600]">{userInfo ? userInfo.fullName : 'Guest'}</h3>
        <p className="text-[13px]">{userInfo ? userInfo.phone : ''}</p>
      </div>

      <ul className="list-none myAccountTabs flex flex-row xl:flex-col gap-1">
        {menuItems.map((item, index) => (
          <li key={index} className="w-full">
            <NavLink to={item.path} activeclassname="isActive">
              <Button className="w-full !text-black !bg-[#f1f1f1] !my-1 !rounded-none flex gap-2 items-center">
                <span className="block xl:hidden text-[20px] p-2">{item.icon}</span>
                <span className="hidden xl:block">{item.label}</span>
              </Button>
            </NavLink>
          </li>
        ))}
        <li className="w-full">
          <Button
            className="w-full !text-black !bg-[#f1f1f1] !my-1 !rounded-none flex gap-2 items-center"
            onClick={handleLogout}
          >
            <span className="block xl:hidden text-[20px] p-2">
              <IoIosLogOut />
            </span>
            <span className="hidden xl:block">Logout</span>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default AccountSlidebar;
