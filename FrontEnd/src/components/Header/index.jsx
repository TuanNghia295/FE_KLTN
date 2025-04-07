import { Link } from 'react-router-dom';
import logoWhiteTheme from '../../assets/logoWhiteTheme.jpg';
import Search from '../Search';
import Badge from '@mui/material/Badge';
import { styled, StyledEngineProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Favorite from '@mui/icons-material/Favorite';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Navigation from './Navigation';
import { useState } from 'react';
import { Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import '../Header/style.css';
import { logout } from '../../services/authServices.jsx';
import useStore from '../../store/useStore.jsx';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 4,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const CustomTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'black',
    color: 'white',
  },
});

export default function Header() {
  // Lấy trạng thái và hàm từ Zustand store
  const userInfo = useStore((state) => state.userInfo);
  const clearInfo = useStore((state) => state.clearInfo);
  const cartItems = useStore((state) => state.cartItems);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    clearInfo();
  };

  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const toggleMobileMenu = () => setOpenMobileMenu(!openMobileMenu);

  return (
    <header className="bg-white">
      {/* Top strip */}
      <div className="top-strip py-2 border-t-[1px] border-b-[1px] border-gray-250">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="col1 w-[50%]">
              <p className="text-[14px] font-[400]">Get up to 50% off for the new season.</p>
            </div>
            <div className="col2 flex items-center justify-end">
              <ul className="flex items-center gap-2">
                <li className="list-none">
                  <Link to={'/help-center'} className="text-[13px] link font-[500] transition">
                    Help
                  </Link>
                </li>
                <li className="list-none">
                  <Link to={'/order-tracking'} className="text-[13px] link font-[500] transition">
                    Order Tracking
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="header py-3 border-b-[1px] border-gray-250">
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <div className="col1 w-[80px] xl:w-[30%] items-center">
            <Link to={'/'} className="w-full">
              <img src={logoWhiteTheme} alt="Logo" className="xl:w-1/3 object-contain" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="col2 md:w-full w-[45%]">
            <Search />
          </div>

          <div className="col3 w-full xl:w-[30%] flex items-center pl-7">
            <ul className="flex items-center justify-end gap-3 w-full">
              {/* User Login/Logout */}
              <li className="list-none block">
                {userInfo ? (
                  <div className="relative" onClick={toggleMobileMenu}>
                    <Avatar alt={userInfo.fullName} src="/static/images/avatar/1.jpg" />
                    {/* Sub Menu */}
                    <ul
                      className={`submenuProfile w-[200px] mt-2 right-0 shadow-2xl bg-[#fff] p-2 border border-[#00000094] rounded-xl absolute z-[100] text-[14px] flex flex-col text-center gap-1
                  ${!openMobileMenu ? 'hidden' : 'block'}`}
                      onClick={() => setOpenMobileMenu(false)}
                    >
                      <div className="infoUser flex flex-col border-b-2 border-[#f3f3f3]">
                        {userInfo ? (
                          <>
                            <p className="font-[600]">{userInfo.fullName}</p>
                            <p className="font-[300]">{userInfo.phone}</p>
                          </>
                        ) : (
                          <p className="font-[600]">Guest</p>
                        )}
                      </div>
                      <li className="hover:bg-[#f1f1f1] px-5 xl:px-10 py-2 rounded-md cursor-pointer">
                        <Link to="/my-account">My Account</Link>
                      </li>
                      <li
                        className="hover:bg-[#f1f1f1] px-5 xl:px-10 py-2 rounded-md cursor-pointer"
                        onClick={handleLogout}
                      >
                        Log Out
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <Link to={'/login'} className="link transition text-[16px] font-[500]">
                      Sign In
                    </Link>
                  </div>
                )}
              </li>

              {/* Cart */}
              <li>
                <StyledEngineProvider injectFirst>
                  <CustomTooltip title="Giỏ hàng">
                    <IconButton aria-label="cart" onClick={() => {
                      setOpenCartPanel(true)
                      }}>
                      <StyledBadge badgeContent={cartItems.length} color="error">
                        <ShoppingCartIcon style={{ color: '#000' }} />
                      </StyledBadge>
                    </IconButton>
                  </CustomTooltip>
                </StyledEngineProvider>
              </li>

              {/* Wishlist */}
              {/* <li>
                <StyledEngineProvider injectFirst>
                  <CustomTooltip title="Danh sách yêu thích">
                    <IconButton aria-label="wishlist">
                      <Favorite style={{ color: '#000' }} />
                    </IconButton>
                  </CustomTooltip>
                </StyledEngineProvider>
              </li> */}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </header>
  );
}
