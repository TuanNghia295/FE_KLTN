import React from 'react'
import { PiEyeClosedDuotone } from "react-icons/pi";
import { Link } from "react-router";
import { CgPlayTrackPrevR } from "react-icons/cg";

const Page404 = ({hscreen}) => {
  return (
    <section className={`w-full h-[450px] bg-white ${hscreen} text-black flex flex-col items-center justify-center`}>
            <PiEyeClosedDuotone className='text-[150px]' />
            <h1 className='text-[50px]'>Page Not Found !</h1>
            <Link to='/'>
                <button className='border px-10 py-2 rounded-md text-[20px] flex items-center gap-3 bg-[#000] shadow-md text-white !mt-10 hover:bg-blackduration-700 cursor-pointer'><CgPlayTrackPrevR />Return</button>
            </Link>
    </section>
  )
}

export default Page404
