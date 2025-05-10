import React, { useState } from 'react'
import { Link, Links } from 'react-router-dom';
import '../Login/style.css'
import Banner1  from '../../assets/log-reg/1.jpg'
import { SiNike } from "react-icons/si";
import OtpInput from "react-otp-input";
import { Button } from '@mui/material';
import '../VerifyAccount/style.css'

const VerifyAccount = () => {
    const [otp, setOtp] = useState("");

  return (
    <section className='section py-10 xl:py-0'>
        <div className='container-fuild flex xl:bg-white xl:h-screen'>
            <div className='hidden xl:block relative'>
                <img className='h-screen' src={Banner1} />
                <div className='absolute bg-black opacity-90 w-full h-full top-[0px]'>
                </div>
                <div className='absolute top-[20%] p-10'>
                    <Link to="/"><SiNike className='text-white text-[100px]' /></Link>
                    <h1 className=' text-white text-[50px]'>Hi, everyone !</h1>
                    <p className='text-[#f1f1f1] mt-5 w-[80%] text-justify'>Nike is a global sportswear brand known for its athletic shoes, apparel, and equipment. Founded in 1964, it is famous for its innovation, iconic "Swoosh" logo, and "Just Do It" slogan.</p>
                </div>
            </div>
            <div className='card  p-4 w-[90%] md:w-[55%] xl:w-[20%] m-auto bg-white'>
                    <form className='w-full flex flex-col mt-5 !justify-center items-center gap-10'>
                        <img className='w-20 h-20' src="https://www.compliancegate.com/wp-content/uploads/2021/12/compliance-check.png"/>
                        <div className=''>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderInput={(props) => <input {...props} />} // Đảm bảo có `renderInput`
                            inputStyle={{
                            width: "3.5rem",
                            height: "3.5rem",
                            margin: "0 0.5rem",
                            fontSize: "1.5rem",
                            textAlign: "center",
                            borderRadius: "5px",
                            border: "1px solid rgb(0, 155, 8)",
                            }}
                        />
                        </div>
                        <Button className='btn-Verify w-full'>Verify</Button>
                    </form>
            </div>
        </div>
    </section>
  )
}

export default VerifyAccount