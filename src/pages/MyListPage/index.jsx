
import React from 'react'
import { MdDeleteForever } from "react-icons/md";
import AccountSlidebar from '../../components/AccountSlidebar';

const MyListPage = () => {
  return (
    <section className='py-10 w-full'>
        <div className='container flex flex-col xl:flex-row gap-5'>
            <div className='col1 w-full xl:w-[20%]'>
                <AccountSlidebar/>
            </div>

            <div className='col2 w-full xl:w-[80%]'>
                <div className='card bg-white p-5 rounded-md'>
                    <h1 className='text-[22px] font-[600] mb-4'>MY LIST</h1>
                    <div className='cartItem w-full flex items-center gap-4 hover:bg-[#f1f1f1] mb-2'>
                        <div className='img w-[25%] xl:w-[10%]'>
                            <img src="https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/598c8584-652e-4167-a659-86a043523c57/M+VAPOR+LITE+3+HC+C.png"/>
                        </div>
                        <div className='cartItemInfo font-[300] w-[85%] flex items-center'>
                            <div className=''>
                                <h4 className='text-[14px]'>Footwear</h4>
                                <h1 className='text-[20px] font-bold'>Nike Dunk 2025</h1>
                            </div>
                                                
                            <div className='ml-auto'>
                                <MdDeleteForever className='text-[30px]'/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default MyListPage