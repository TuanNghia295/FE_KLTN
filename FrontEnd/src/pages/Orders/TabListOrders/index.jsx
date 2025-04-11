import React, { Fragment, useState } from 'react';
import { IoCheckboxOutline } from 'react-icons/io5';
import { FaInbox } from 'react-icons/fa6';
import { FaCarSide } from 'react-icons/fa';
import { FaRegCheckCircle } from 'react-icons/fa';
import { PiKeyReturnFill } from 'react-icons/pi';
import { FaAngleDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const tabs = [
  {
    icon: <IoCheckboxOutline />,
    name: 'Confirm',
    data: [{ col1: '617294857624', col2: '28' }],
  },
  {
    icon: <FaInbox />,
    name: 'Packing',
    data: [{ col1: '617294857625', col2: '28' }],
  },
  {
    icon: <FaCarSide />,
    name: 'Delivering',
    data: [{ col1: '617294857624', col2: '22' }],
  },
  {
    icon: <FaRegCheckCircle />,
    name: 'Complete',
    data: [{ col1: '617294857624', col2: '2222' }],
  },
  {
    icon: <PiKeyReturnFill />,
    name: 'Return',
    data: [{ col1: '617294857624', col2: 'John' }],
  },
];

const TabListOrders = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex justify-center border-b border-gray-200 mb-4">
        {tabs.map((tab, index) => (
          <Fragment key={index}>
            <button
              onClick={() => setActiveTab(index)}
              className={`px-2 py-3 xl:px-10 xl:py-2 xl:w-[20%] text-[14px] font-[300] flex flex-col items-center gap-2 focus:outline-none ${
                activeTab === index
                  ? 'text-black font-[500] bg-[#f1f1f1] border-b-2 border-black'
                  : 'text-gray-600 hover:font-[500] hover:bg-[#f1f1f1] duration-300'
              }`}
            >
              <span className="text-[20px]">{tab.icon}</span>
              {tab.name}
            </button>
          </Fragment>
        ))}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="border border-gray-300 divide-y divide-gray-200 mt-3">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Order Details</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Order ID</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Payment ID</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Time</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Full Name</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Phone Number</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Address</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {tabs[activeTab].data.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 bg-[#f1f1f1]">
                  <Link to={`/my-orders/order/${row.col1}`}>Click Here</Link>
                </td>
                <td className="px-4 py-2">
                  <Link to={`/my-orders/order/${row.col1}`}>{row.col1}</Link>
                </td>
                <td className="px-4 py-2">{row.col2}</td>
                <td className="px-4 py-2">12:09 4/3/2025</td>
                <td className="px-4 py-2">Admin</td>
                <td className="px-4 py-2">0704539076</td>
                <td className="px-4 py-2">Yersin, District 1, HCM City</td>
                <td className="px-4 py-2">Pending</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabListOrders;
