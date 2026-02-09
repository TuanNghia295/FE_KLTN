import React, { useState } from 'react';
import AccountSlidebar from '../../components/AccountSlidebar';
import '../Orders/style.css';
import TabListOrders from './TabListOrders';
import { useOrder } from '../../services/orderServices';
import LoadingComponent from '../../components/LoadingComponent';

const STATUS_MAP = {
  'Chờ xử lý': 'pending',
  'Đang giao': 'shipping',
  'Hoàn thành': 'completed',
  'Đã hủy': 'cancelled',
};

const Orders = () => {
  const [activeStatus, setActiveStatus] = useState('Chờ xử lý');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const statusParam = STATUS_MAP[activeStatus];

  const { myOrdder, isLoadingOrder } = useOrder({
    status: statusParam,
    page: currentPage,
    perPage,
  });

  const handleTabChange = (statusLabel) => {
    setActiveStatus(statusLabel);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col xl:flex-row gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>

        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md">
            {isLoadingOrder ? (
              <LoadingComponent />
            ) : (
              <TabListOrders
                orders={myOrdder?.orders}
                meta={myOrdder?.meta}
                activeStatus={activeStatus}
                onTabChange={handleTabChange}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
