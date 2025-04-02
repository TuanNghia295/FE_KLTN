import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { IoMdEye } from 'react-icons/io'
import { IoMdEyeOff } from 'react-icons/io'
import { FcGoogle } from "react-icons/fc";
import { Link, Links } from 'react-router-dom';
import '../Login/style.css'
import Banner1 from '../../assets/log-reg/1.jpg'
import { SiNike } from "react-icons/si";
//Call API Login
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useLogin } from '../../apis/authServices';


const Login = () => {
    const [isShowPassword, setIsShowPassword] = useState(true);

    const { mutate, isPending } = useLogin();

    const formik = useFormik({
        initialValues: {
            phone: '',
            password: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string().required('Phone is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: (values) => {
            mutate(values);
        }
    })

    console.log(formik)

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
                <div className='card  p-4 w-[90%] md:w-[55%] xl:w-[35%] m-auto bg-white'>
                    <div className='flex justify-between xl:justify-center items-center'>
                        <Link to="/" className='block xl:hidden text-[30px]'><SiNike /></Link>
                        <h3 className='text-center text-[30px] font-bold text-black'>SIGN IN</h3>
                    </div>
                    <form className='w-full mt-5' onSubmit={formik.handleSubmit} >
                        <div className='form-group w-full mb-5'>
                            <TextField type="phone" className='w-full' name="phone" label="Phone" variant="outlined" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.phone} />
                        </div>

                        <div className='form-group w-full relative'>
                            <TextField className='w-full' id="password" label="Password" variant="outlined" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.password}
                                type={
                                    isShowPassword === true ? 'password' : ''
                                }
                            />
                            <Button className='!absolute !text-black !text-[20px] top-[3px] right-[5px] z-50 !w-[50px] !h-[50px] !min-w-[35px]'
                                onClick={() => setIsShowPassword(!isShowPassword)}
                            >
                                {
                                    isShowPassword === true ? <IoMdEye /> : <IoMdEyeOff />
                                }
                            </Button>
                        </div>

                        <div className='flex items-center mt-5'>
                            <Button className={`btn-Login w-full ${isPending ? " !text-[#fff]" : ""}`} type="submit">{isPending ? "Loading..." : "Login"}</Button>
                        </div>

                        <div className='flex w-full items-center mt-5'>
                            <div>
                                <Link to='/'>Forgot Password ?</Link>
                            </div>
                            <div className='ml-auto text-[#ff2f2f] font-[600]'>
                                <Link to='/register'>Sign Up</Link>
                            </div>
                        </div>

                        <div className="flex items-center w-full mt-5">
                            <div className="flex-grow border-t border-gray-400"></div>
                            <span className="px-4 text-gray-600">Or continute with social account</span>
                            <div className="flex-grow border-t border-gray-400"></div>
                        </div>

                        <div className='flex items-center mt-5'>
                            <Button className='btn-LoginGoogle !bg-[#f1f1f1] w-full '><FcGoogle className='!text-[30px]' /> &nbsp; | &nbsp;Login with Google</Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Login