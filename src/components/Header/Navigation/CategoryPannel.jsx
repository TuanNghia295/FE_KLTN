import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { IoClose } from 'react-icons/io5';
import { useState } from 'react';
import CategoryCollapse from '../../CatergoryCollapse';

const CategoryPannel = ({categoryListZustand, isOpenCategory, toogleCategory }) => {
  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" className="category-pannel">
      <h3 className="text-[18px] p-3 font-[500] flex items-center justify-between">
        Categories <IoClose className="cursor-pointer text-[20px] " onClick={toogleCategory} />
      </h3>

      {/*List category */}
      <CategoryCollapse categoryListZustand={categoryListZustand} />
    </Box>
  );

  return (
    <>
      <Drawer open={isOpenCategory}>{DrawerList}</Drawer>
    </>
  );
};

export default CategoryPannel;
