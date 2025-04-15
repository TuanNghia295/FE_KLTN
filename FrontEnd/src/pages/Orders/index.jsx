import React, { useEffect, useState } from 'react';
import AccountSlidebar from '../../components/AccountSlidebar';
import '../Orders/style.css';
import TabListOrders from './TabListOrders';
import axiosClient from '../../apis/axiosClient';
import { useOrder } from '../../services/orderServices';
import LoadingComponent from '../../components/LoadingComponent';

const Orders = () => {
  const { myOrdder, isLoadingOrder } = useOrder();

  return (
    <section className="py-10 w-full">
      <div className="container flex flex-col xl:flex-row gap-5">
        <div className="col1 w-full xl:w-[20%]">
          <AccountSlidebar />
        </div>

        <div className="col2 w-full xl:w-[80%]">
          <div className="card bg-white p-5 rounded-md">
            {isLoadingOrder ? <LoadingComponent /> : <TabListOrders orders={myOrdder?.orders} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
