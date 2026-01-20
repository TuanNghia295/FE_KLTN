import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { Link } from 'react-router-dom';
import '../Register/style.css';
import Banner1 from '../../assets/log-reg/1.jpg';
import { SiNike } from 'react-icons/si';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '../../services/authServices.jsx';

const Register = () => {
  const [isShowPassword, setIsShowPassword] = useState(true);
  const { mutate } = useRegister();

  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Confirm password is required'),
    }),
    onSubmit: (values) => {
      console.log('values', values);
      mutate({ auth: values });
    },
  });

  return (
    <section className="section py-10 xl:py-0">
      <div className="container-fuild flex xl:bg-white xl:h-screen">
        {/* LEFT BANNER */}
        <div className="hidden xl:block relative">
          <img className="h-screen" src={Banner1} />
          <div className="absolute bg-black opacity-90 w-full h-full top-0"></div>
          <div className="absolute top-[20%] p-10">
            <SiNike className="text-white text-[100px]" />
            <h1 className="text-white text-[50px]">Hi, everyone!</h1>
            <p className="text-[#f1f1f1] mt-5 w-[80%] text-justify">
              Nike is a global sportswear brand known for its athletic shoes, apparel, and equipment.
            </p>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="card p-4 w-[90%] md:w-[55%] xl:w-[35%] m-auto bg-white">
          <div className="flex justify-between xl:justify-center items-center">
            <Link to="/" className="block xl:hidden text-[30px]">
              <SiNike />
            </Link>
            <h3 className="text-center text-[30px] font-bold text-black">SIGN UPppp</h3>
          </div>

          <form onSubmit={formik.handleSubmit} className="w-full mt-5">
            {/* FULL NAME */}
            <div className="form-group w-full mb-5">
              <TextField
                fullWidth
                id="full_name"
                name="full_name"
                label="Full Name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.full_name}
              />
              {formik.touched.full_name && formik.errors.full_name && (
                <p className="text-red-500 text-sm">{formik.errors.full_name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="form-group w-full mb-5">
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-group w-full mb-5 relative">
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={isShowPassword ? 'password' : 'text'}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <Button
                type="button"
                className="!absolute !text-black top-[8px] right-[5px]"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword ? <IoMdEye /> : <IoMdEyeOff />}
              </Button>

              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group w-full mb-5 relative">
              <TextField
                fullWidth
                id="password_confirmation"
                name="password_confirmation"
                label="Confirm Password"
                type={isShowPassword ? 'password' : 'text'}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.password_confirmation}
              />
              <Button
                type="button"
                className="!absolute !text-black top-[8px] right-[5px]"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword ? <IoMdEye /> : <IoMdEyeOff />}
              </Button>

              {formik.touched.password_confirmation && formik.errors.password_confirmation && (
                <p className="text-red-500 text-sm">{formik.errors.password_confirmation}</p>
              )}
            </div>

            {/* SUBMIT */}
            <Button type="submit" className="btn-Login w-full">
              Register
            </Button>

            <div className="flex w-full items-center mt-5">
              <Link to="/">Forgot Password?</Link>
              <div className="ml-auto text-[#ff2f2f] font-semibold">
                <Link to="/login">Sign In</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
