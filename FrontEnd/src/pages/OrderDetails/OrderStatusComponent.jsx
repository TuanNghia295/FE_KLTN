import React, { useEffect, useState } from 'react';

const OrderStatus = ({ status }) => {
  const statuses = [
    { id: 1, name: 'Đã Đặt', isActive: status === 'Pending' },
    { id: 2, name: 'Đang vận chuyển', isActive: status === 'Processing' },
    { id: 3, name: 'Đang Giao', isActive: status === 'Completed' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const targetIndex = statuses.findIndex((item) => item.isActive);

  useEffect(() => {
    if (currentIndex !== targetIndex) {
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
  }, [targetIndex]);

  return (
    <div className="flex flex-row justify-between items-center p-5 md:p-10 relative w-full overflow-hidden">
      <div className="absolute top-7 md:top-12 right-10 md:right-14  xl:right-16 transform -translate-y-1/2 w-[85%] md:w-[86%] xl:w-[92%] h-1 bg-gray-200">
        {statuses.map(
          (item, index) =>
            index < statuses.length - 1 && (
              <div
                key={index}
                className={`absolute h-1 transition-all duration-300 ${
                  index < currentIndex ? 'bg-red-500' : 'bg-gray-200'
                }`}
                style={{
                  left: `${(index / (statuses.length - 1)) * 100}%`,
                  right: `${100 - ((index + 1) / (statuses.length - 1)) * 100}%`,
                }}
              />
            )
        )}
      </div>
      {statuses.map((item, index) => (
        <div key={item.id} className="flex flex-col items-center relative">
          <div className={`h-4 w-4 rounded-full ${index <= currentIndex ? 'bg-red-500' : 'bg-gray-300'}`}></div>
          <span
            className={`text-xs md:text-sm mt-3 ${
              index <= currentIndex ? 'text-red-600 font-medium' : 'text-gray-500'
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
