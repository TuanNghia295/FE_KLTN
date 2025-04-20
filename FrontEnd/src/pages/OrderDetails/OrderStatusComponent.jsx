import React, { useEffect, useState } from 'react';

const OrderStatus = ({ status }) => {
  const statuses = [
    { id: 1, name: 'Đã Đặt', isActive: status === 'Pending' },
    { id: 2, name: 'Đang Vận Chuyển', isActive: status === 'Processing' },
    { id: 3, name: 'Đã Giao', isActive: status === 'Completed' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const targetIndex = statuses.findIndex((item) => item.isActive);

  useEffect(() => {
    if (currentIndex !== targetIndex && targetIndex !== -1) {
      const step = targetIndex > currentIndex ? 1 : -1;
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev + step === targetIndex) {
            clearInterval(interval);
          }
          return prev + step;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [currentIndex, targetIndex]);

  return (
    <div className="flex justify-between items-center w-full py-4 relative">
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" />
      <div
        className="absolute top-6 left-0 h-1 bg-red-500 transition-all duration-500 ease-out"
        style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
      />

      {/* Status Points */}
      {statuses.map((item, index) => (
        <div key={item.id} className="flex flex-col items-center relative z-10">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              index <= currentIndex ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            {index <= currentIndex && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
          <span
            className={`mt-2 text-xs font-medium transition-colors duration-300 ${
              index <= currentIndex ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStatus;
