import React, { useState } from 'react'
import { Button, FormControlLabel } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import '../SlideBar/style.css'
import { Collapse } from 'react-collapse'
import { FaAngleDown } from 'react-icons/fa'
import { FaAngleUp } from 'react-icons/fa'
import RangeSlider from 'react-range-slider-input'
import 'react-range-slider-input/dist/style.css'


const SlideBar = ({categoryListZustand, selectedCate, onCategorySelect  }) => {
  const checked = categoryListZustand.find((c) => c._id === selectedCate)

  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [isOpenAvailFilter, setIsOpenAvailFilter] = useState(true);

  return (
    <aside className='slidebar'>
        <div className='box mb-3'>
            {/*Filter hien thi full*/}
            <h1 className='flex mb-3 !text-black text-[16px] font-[600] items-center'>Category
            <Button className=' !text-black !ml-auto' onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)} >
              {
                isOpenCategoryFilter===true ? <FaAngleUp/> : <FaAngleDown/>
              } 
            </Button>
            </h1>
            <Collapse isOpened={isOpenCategoryFilter}>
              <div className='scroll max-h-[200px] md:max-h-[250px] relative '>
                {Array.isArray(categoryListZustand) && categoryListZustand?.length > 0
                ? categoryListZustand?.map((category) => (
                  <FormControlLabel key={category._id || category.type} className='w-full' control={<Checkbox size='small' checked={checked?._id === category._id} value={category._id} onChange={() => onCategorySelect(category.type) } />} label={category?.type} />
                ))
                : ""
                }
              </div>
            </Collapse>  
        </div>

        <div className='box mb-3'>
            {/*Filter hien thi full*/}
            <h1 className='flex mb-3 !text-black text-[16px] font-[600] items-center'>Availability
            <Button className=' !text-black !ml-auto' onClick={() => setIsOpenAvailFilter(!isOpenAvailFilter)} >
              {
                isOpenAvailFilter===true ? <FaAngleUp/> : <FaAngleDown/>
              } 
            </Button>
            </h1>
            <Collapse isOpened={isOpenAvailFilter}>
              <div className='scroll max-h-[200px] md:max-h-[250px] relative '>
                <FormControlLabel className='w-full' control={<Checkbox size='small'/>} label="Available (17)" />
                <FormControlLabel className='w-full' control={<Checkbox size='small'/>} label="In Stock (15)" />
                <FormControlLabel className='w-full' control={<Checkbox size='small'/>} label="Not Available (1)" />
              </div>
            </Collapse>  
        </div>

        {/* <div className='box mb-3'> */}
            {/* Filter hien thi full
            <h1 className='flex mb-3 !text-black text-[16px] font-[600] items-center'>Price
            </h1>
            <RangeSlider/>
            <div className='flex pt-2 pb-2 priceRange text-[10px]'>
              <span>
                From: <strong className='text-dark'>{500}</strong>
              </span>
              <span className='ml-auto'>
                To: <strong className='text-dark'>{1000}</strong>
              </span>
            </div> */}
        {/* </div> */}
    </aside>
  )
}

export default SlideBar;