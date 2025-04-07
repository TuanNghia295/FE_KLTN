import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header/index.jsx';
import Home from './pages/Home/index.jsx';
import ProductListing from './pages/ProductListing/index.jsx';
import Footer from './pages/Footer/index.jsx';
import ProductDetails from './pages/ProductDetails/index.jsx';
import Login from './pages/Login/index.jsx';
import Register from './pages/Register/index.jsx';
import Drawer from '@mui/material/Drawer';
import { useEffect } from 'react';
import CartPanel from './components/CartPanel/index.jsx';
import Cart from './pages/Cart/index.jsx';
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

export const MainLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

export default function App() {
  // Lấy trạng thái và hàm từ Zustand store
  const openCartPanel = useStore((state) => state.openCartPanel);
  const setOpenCartPanel = useStore((state) => state.setOpenCartPanel);
  const fetchUserInfo = useStore((state) => state.fetchUserInfo);

  useEffect(() => {
    fetchUserInfo(); // Lấy thông tin người dùng khi ứng dụng khởi chạy
  }, [fetchUserInfo]);

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
          <Route path={'/register'} exact={true} element={<Register />} />
          <Route path={'/verify'} exact={true} element={<VerifyAccount />} />
          <Route
            path={'/cart'}
            exact={true}
            element={
              <MainLayout>
                <Cart />
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
            path="/listing/:category"
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
        </Routes>

        <Drawer open={openCartPanel} onClose={toggleCartPanel(false)} anchor={'right'} className="cartPanel">
          <CartPanel />
        </Drawer>
      </BrowserRouter>
    </>
  );
}
