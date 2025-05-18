import { useEffect, useState } from 'react';

import { FaCheckCircle, FaShippingFast, FaBoxOpen, FaRegClock, FaTimesCircle } from 'react-icons/fa';

const statusSteps = [
  { key: 'Pending', label: 'Đã Đặt', icon: <FaRegClock /> },
  { key: 'Processing', label: 'Đang Vận Chuyển', icon: <FaShippingFast /> },
  { key: 'Completed', label: 'Đã Giao', icon: <FaBoxOpen /> },
];

const OrderStatus = ({ status }) => {
  const targetStep = statusSteps.findIndex((step) => step.key === status);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (targetStep < 0) return;
    if (currentStep === targetStep) return;
    const step = targetStep > currentStep ? 1 : -1;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev + step === targetStep) {
          clearInterval(interval);
        }
        return prev + step;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [targetStep, currentStep]);

  // Nếu bị hủy thì chỉ hiển thị trạng thái hủy
  if (status === 'Cancelled') {
    return (
      <div className="flex flex-col items-center py-6">
        <FaTimesCircle className="text-5xl text-red-500 mb-2 animate-pulse" />
        <span className="text-lg font-bold text-red-600">Order has been cancelled</span>
      </div>
    );
  }

  // Tìm index của trạng thái hiện tại

  return (
    <div className="relative w-full py-6 flex flex-col items-center">
      {/* Progress Bar */}
      <div
        className="absolute mt-6 h-1 bg-gray-200 z-0 sm:left-44 sm:right-24"
        style={{
          width: '70%',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute mt-6 h-1 bg-red-500 z-10 transition-all left-8 duration-500  sm:left-44 "
        style={{
          // width: 'auto',
          width: `calc(${(currentStep / (statusSteps.length - 1)) * 70}%  )`,
          transform: 'translateY(-50%)',
        }}
      />
      {/* Steps */}
      <div className="flex w-full justify-between relative z-20 px-0">
        {statusSteps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={`flex items-center justify-center rounded-full border-4 transition-all duration-300 mx-auto
                        ${
                          isActive
                            ? 'border-red-500 bg-white scale-110 shadow-lg'
                            : isCompleted
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-300 bg-gray-100'
                        }
                        w-12 h-12 text-2xl mb-2`}
              >
                {isCompleted ? <FaCheckCircle className="text-green-500" /> : step.icon}
              </div>
              <span
                className={`text-sm font-semibold mt-1 transition-colors duration-300 text-center block w-full truncate
                        ${isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatus;
