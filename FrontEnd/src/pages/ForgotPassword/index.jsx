import React, { Fragment, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { FcGoogle } from 'react-icons/fc';
import { SiNike } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLogin } from '../../services/authServices';
import Banner1 from '../../assets/log-reg/1.jpg';
import OtpInput from "react-otp-input";

const ForgotPassword = () => {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isOpenOTP, setIsOpenOTP] = useState(false)
    const { mutate: login, isPending, isError } = useLogin();
    const [formData, setFormData] = useState(null);
    const [otp, setOtp] = useState("");

    console.log(formData)

    const formik = useFormik({
        initialValues: {
            phone: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string().required('Vui lòng nhập số điện thoại'),
        }),
        onSubmit: (values) => {
            setIsOpenOTP(true)
            setFormData(values)
        },
    });

    const formik2 = useFormik({
        initialValues: {
            phone: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string().required('Vui lòng nhập số điện thoại'),
        }),
        onSubmit: (values) => {
            //   login(values); // Gọi mutation để thực hiện đăng nhập
        },
    });

    const togglePasswordVisibility = () => {
        setIsShowPassword(!isShowPassword);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: { xs: 'grey.100', xl: 'white' } }}>
            {/* Cột Banner */}
            <Box
                sx={{
                    display: { xs: 'none', xl: 'block' },
                    width: '50%',
                    position: 'relative',
                    '& img': {
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                    },
                    '& .overlay': {
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                    '& .content': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white',
                        p: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: '100%',
                    },
                }}
            >
                <img src={Banner1} alt="Nike Banner" />
                <div className="overlay" />
                <div className="content">
                    <Link to="/">
                        <SiNike style={{ fontSize: 100, marginBottom: 20 }} />
                    </Link>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                        Welcome Back!
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '80%', textAlign: 'justify', color: 'grey.300' }}>
                        Sign in to access your account, track orders, and enjoy a seamless shopping experience with Nike.
                    </Typography>
                </div>
            </Box>

            {/* Cột Form */}
            <Box
                sx={{
                    display: 'flex',
                    width: { xs: '100%', xl: '50%' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, md: 4 },
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'white',
                        p: { xs: 3, md: 5 },
                        borderRadius: 2,
                        boxShadow: { xs: 3, xl: 'none' },
                        width: '100%',
                        maxWidth: '450px',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Link to="/" style={{ display: { xs: 'block', xl: 'none' }, color: 'black' }}>
                            <SiNike size={30} />
                        </Link>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{ fontWeight: 'bold', textAlign: { xs: 'right', xl: 'center' }, width: '100%' }}
                        >
                            FORGOT PASSWORD
                        </Typography>
                    </Box>

                    {/* Form Send */}
                    {!isOpenOTP ? (
                        <form onSubmit={formik.handleSubmit} noValidate>
                            {/* Phone Input */}
                            <TextField
                                fullWidth
                                margin="normal"
                                id="phone"
                                name="phone"
                                label="Số điện thoại"
                                variant="outlined"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                helperText={formik.touched.phone && formik.errors.phone}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    bgcolor: 'black',
                                    '&:hover': { bgcolor: 'grey.800' },
                                    '&.Mui-disabled': { bgcolor: 'grey.500', color: 'white' },
                                }}
                            >
                                {isPending ? (<Fragment><CircularProgress size={24} sx={{ color: 'white' }} /></Fragment>) : ('Send OTP')}
                            </Button>

                            {/* Password Input */}
                            {/* <TextField
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="Mật khẩu"
                            variant="outlined"
                            type={isShowPassword ? 'text' : 'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <Button
                                        aria-label={isShowPassword ? 'Hide password' : 'Show password'}
                                        onClick={togglePasswordVisibility}
                                        sx={{ minWidth: 'auto', padding: '5px', color: 'text.secondary' }}
                                    >
                                        {isShowPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                                    </Button>
                                ),
                            }}
                        /> */}

                            {/* Hiển thị lỗi nếu có */}
                            {isError && (
                                <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                    Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.
                                </Typography>
                            )}
                        </form>
                    ) : ""}

                    {/* Form Set */}
                    {isOpenOTP ? (
                        <>
                            <form onSubmit={formik.handleSubmit} noValidate>
                                <div className='flex justify-center my-2'>
                                    <p className='font-bold'>Hi, {formData?.phone}. Please confirm OTP code here !</p>
                                </div>
                                <div className='bg-[#f1f1f1] justify-center flex rounded-lg p-4'>
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                        numInputs={6}
                                        renderInput={(props) => <input {...props} />} // Đảm bảo có `renderInput`
                                        inputStyle={{
                                            width: "3rem",
                                            height: "3rem",
                                            margin: "0 0.4rem",
                                            fontSize: "1.5rem",
                                            textAlign: "center",
                                            borderRadius: "5px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                </div>
                                {/* Password Input */}
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="password"
                                    name="password"
                                    label="Password"
                                    variant="outlined"
                                    type={isShowPassword ? 'text' : 'password'}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                aria-label={isShowPassword ? 'Hide password' : 'Show password'}
                                                onClick={togglePasswordVisibility}
                                                sx={{ minWidth: 'auto', padding: '5px', color: 'text.secondary' }}
                                            >
                                                {isShowPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                                            </Button>
                                        ),
                                    }}
                                />

                                {/* Password Input */}
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    variant="outlined"
                                    type={isShowPassword ? 'text' : 'password'}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                aria-label={isShowPassword ? 'Hide password' : 'Show password'}
                                                onClick={togglePasswordVisibility}
                                                sx={{ minWidth: 'auto', padding: '5px', color: 'text.secondary' }}
                                            >
                                                {isShowPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                                            </Button>
                                        ),
                                    }}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        bgcolor: 'black',
                                        '&:hover': { bgcolor: 'grey.800' },
                                        '&.Mui-disabled': { bgcolor: 'grey.500', color: 'white' },
                                    }}
                                >
                                    {isPending ? (<Fragment><CircularProgress size={24} sx={{ color: 'white' }} /></Fragment>) : ('Set Password')}
                                </Button>

                                {/* Hiển thị lỗi nếu có */}
                                {isError && (
                                    <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                        Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.
                                    </Typography>
                                )}
                            </form>
                        </>
                    ) : ""}
                </Box>
            </Box>
        </Box>
    );
};

export default ForgotPassword;
