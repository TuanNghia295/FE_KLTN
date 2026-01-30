import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header/index.jsx';
import Home from './pages/Home/index.jsx';
import ProductListing from './pages/ProductListing/index.jsx';
import Footer from './pages/Footer/index.jsx';
import ProductDetails from './pages/ProductDetails/index.jsx';
import Login from './pages/Login/index.jsx';
import Reg from './pages/Register/index2.jsx';
import Drawer from '@mui/material/Drawer';
import { useEffect } from 'react';
import CartPanel from './components/CartPanel/index.jsx';
import CheckOut from './pages/CheckOut/index.jsx';
import MyAccount from './pages/MyAccount/index.jsx';
import Orders from './pages/Orders/index.jsx';
import MyListPage from './pages/MyListPage/index.jsx';
import VerifyAccount from './pages/VerifyAccount/index.jsx';
import MyAddress from './pages/MyAddress/index.jsx';
import { ToastContainer } from 'react-toastify';
import OrderDetails from './pages/OrderDetails/index.jsx';
import ScrollToTop from './components/Scroll/ScrollToTop.jsx';
import useStore from './store/useStore.jsx';
import { useGetCart } from '../src/services/cartServices.jsx';
import { useGetCategory } from './services/categoryServices.jsx';
import PaymentError from './pages/CheckOut/PaymentError.jsx';
import PaymentSuccess from './pages/CheckOut/PaymentSuccess.jsx';
import Page404 from './pages/Page404/index.jsx';
import SearchPage from './pages/SearchPage/index.jsx';
import ForgotPassword from './pages/ForgotPassword/index.jsx';
import ResetPassword from './pages/ResetPassWord/index.jsx';
import ChatPage from './pages/Chatbox/index.jsx';
import ChatBoxCoze from './components/ChatboxCoze/index.jsx';

export const MainLayout = ({ children }) => (
  <>
    <Header />
    <ChatBoxCoze />
    <main>{children}</main>
    <Footer />
  </>
);

export default function App() {
  // Lấy trạng thái và hàm từ Zustand store
  const openCartPanel = useStore((state) => state.openCartPanel);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);

  const fetchUserInfo = useStore((state) => state.fetchUserInfo);

  // Lấy thông tin giỏ hàng từ database (React Query vào Zustand)
  const userInfo = useStore((state) => state.userInfo); // Lấy ra user id từ fetchUserInfo ở Zustand
  const hydrated = useStore((state) => state.hydrated);
  const setLoadingCart = useStore((state) => state.setLoadingCart);
  const userId = userInfo?._id ?? userInfo?.id;
  const { cart, loadingCart } = useGetCart(hydrated && !!userId); // List ra danh sách bằng user id
  const setCartItems = useStore((state) => state.setCartItems); // Dùng useEffect để bỏ sản phẩm từ database lưu trữ vào Zustand
  const setCartSource = useStore((state) => state.setCartSource);
  const guestCartItems = useStore((state) => state.guestCartItems);

  //Call API Get Danh Muc
  const { categoryList } = useGetCategory();
  const setCategoryListZustand = useStore((state) => state.setCategoryListZustand);

  useEffect(() => {
    if (categoryList && categoryList.length > 0) {
      setCategoryListZustand(categoryList);
    }
  }, [categoryList]);

  useEffect(() => {
    if (!hydrated) return;
    fetchUserInfo();
  }, [fetchUserInfo, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (cart && typeof cart === 'object') {
      if (cart?.id) {
        setCartSource('user');
        const normalizedItems = (cart.items || []).map((item) => ({ ...item, id: item.id ?? item._id }));
        setCartItems(normalizedItems);
      } else if (userInfo) {
        setCartSource('user');
        setCartItems([]);
      } else {
        setCartSource('guest');
      }
    } else if (!userInfo && guestCartItems.length > 0) {
      setCartSource('guest');
    }
  }, [cart, userInfo, guestCartItems.length, setCartItems, setCartSource, hydrated]);

  useEffect(() => {
    setLoadingCart(loadingCart);
  }, [loadingCart, setLoadingCart]);

  // useEffect(() => {
  //   if (Array.isArray(listCart) && listCart.length > 0) {
  //     clearCart(); // 🔄 clear trước khi thêm mới (optional)
  //     listCart.forEach((item) => {
  //       addItemToCart(item);
  //     });
  //   }
  // }, [listCart]);

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            exact={true}
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path={'/products/:id'}
            exact={true}
            element={
              <MainLayout>
                <ProductDetails />
              </MainLayout>
            }
          />
          <Route path={'/login'} exact={true} element={<Login />} />
          <Route path={'/register'} exact={true} element={<Reg />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path={'/verify'} exact={true} element={<VerifyAccount />} />
          <Route path={'/chat'} exact={true} element={<ChatPage />} />
          <Route path={'*'} exact={true} element={<Page404 hscreen={'h-screen'} />} />
          <Route
            path="/search"
            element={
              <MainLayout>
                <SearchPage />
              </MainLayout>
            }
          />
          <Route
            path={'/checkout'}
            exact={true}
            element={
              <MainLayout>
                <CheckOut />
              </MainLayout>
            }
          />
          <Route
            path={'/my-account'}
            exact={true}
            element={
              <MainLayout>
                <MyAccount />
              </MainLayout>
            }
          />
          <Route
            path={'/my-list'}
            exact={true}
            element={
              <MainLayout>
                <MyListPage />
              </MainLayout>
            }
          />
          <Route
            path={'/my-orders'}
            exact={true}
            element={
              <MainLayout>
                <Orders />
              </MainLayout>
            }
          />
          <Route
            path={'/my-orders/order/:id'}
            exact={true}
            element={
              <MainLayout>
                <OrderDetails />
              </MainLayout>
            }
          />
          <Route
            path={'/my-address'}
            exact={true}
            element={
              <MainLayout>
                <MyAddress />
              </MainLayout>
            }
          />
          <Route
            path="/listing"
            exact={true}
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:categoryName"
            exact={true}
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:category/:subcategory"
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />

          <Route path="/checkout/error" exact={true} element={<PaymentError />} />
          <Route path="/checkout/success" exact={true} element={<PaymentSuccess />} />
        </Routes>

        <Drawer open={openCartPanel} onClose={toggleCartPanel(false)} anchor={'right'} className="cartPanel">
          <CartPanel />
        </Drawer>
      </BrowserRouter>
    </>
  );
}
