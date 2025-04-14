import React, { useState, useEffect, createContext, useContext } from 'react';
import useStore from '../../store/useStore'

const TabsHomePage = ({handeChangeCate}) => {
  const tabNames = useStore((state) => state.categoryListZustand);
  const [activeTab, setActiveTab] = useState(tabNames[0]?._id);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowButtons(window.innerWidth > 600);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelect = (event) => {
    setActiveTab(event.target.value);
    handeChangeCate(activeTab)
  };

  useEffect(() => {
    handeChangeCate(activeTab)
  }, [activeTab])

  return (
    <>
      <select onChange={handleSelect} value={activeTab} className="px-4 py-2 border rounded-md">
        {tabNames.map((tab) => (
          <option key={tab._id} value={tab._id}>{tab.type}</option>
        ))}
      </select>
      {/* <div className="p-4 border rounded-md bg-gray-50 mb-4">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div> */}
    </>
  );
};

export default TabsHomePage;
