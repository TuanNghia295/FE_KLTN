import React from 'react'
import { PiEyeClosedDuotone } from "react-icons/pi";
import { Link } from "react-router";

const Page404 = () => {
  return (
    <section className='w-full h-[450px] bg-white text-black flex flex-col items-center justify-center'>
            <PiEyeClosedDuotone className='text-[150px]' />
            <h1 className='text-[50px]'>Page Not Found !</h1>
            <Link to='/'>
                <button className='border px-5 py-2 rounded-md text-[20px] bg-[#2e2e2e] text-white !mt-10 hover:bg-blackduration-700 cursor-pointer'>Return Homepage.</button>
            </Link>
    </section>
  )
}

export default Page404
