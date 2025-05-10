import React, { Fragment, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { SiNike } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRegister } from '../../services/authServices';
import Banner1 from '../../assets/log-reg/1.jpg';

const Reg = () => {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const { mutate, isPending } = useRegister();

    const formik = useFormik({
        initialValues: {
            userName: '',
            fullName: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'USER',
            address: 'Default',
        },
        validationSchema: Yup.object({
            userName: Yup.string().required('Username is required'),
            fullName: Yup.string().required('Username is required'),
            phone: Yup.string().required('Phone is required'),
            email: Yup.string().email('Invalid Email').required('Email is required'),
            password: Yup.string().min(6, 'Password must be as least 6 characters'),
            confirmPassword: Yup.string()
                .required('Confirm Password is required')
                .oneOf([Yup.ref('password'), null], 'Password does not match'),
        }),
        onSubmit: (values) => {
            console.log(values)
            mutate(values);
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
                    width: { xs: '100%', xl: '50%' },
                    display: 'flex',
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
                            variant="h4"
                            component="h3"
                            sx={{ fontWeight: 'bold', textAlign: { xs: 'right', xl: 'center' }, width: '100%' }}
                        >
                            SIGN UP
                        </Typography>
                    </Box>

                    <form onSubmit={formik.handleSubmit}>
                        {/* Full Name input */}
                        <TextField
                            fullWidth
                            margin='normal'
                            id="text"
                            name="fullName"
                            label="Full Name"
                            variant="outlined"
                            value={formik.values.fullName}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                            helperText={formik.touched.fullName && formik.errors.fullName}
                        />

                        {/* Username input */}
                        <TextField
                            fullWidth
                            margin="normal"
                            id="userName"
                            name="userName"
                            label="Username"
                            variant="outlined"
                            value={formik.values.userName}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={formik.touched.userName && Boolean(formik.errors.userName)}
                            helperText={formik.touched.userName && formik.errors.userName}
                        />

                        {/* Email input */}
                        <TextField
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={formik.values.email}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />

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

                        {/* Password Input */}
                        <TextField
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
                        />

                        {/* Confirm Password Input */}
                        <TextField
                            fullWidth
                            margin="normal"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            variant="outlined"
                            type={isShowPassword ? 'text' : 'password'}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                            {isPending ? (<Fragment><CircularProgress size={24} sx={{ color: 'white' }} /></Fragment>) : ('Sign Up')}
                        </Button>

                        {/* Hiển thị lỗi nếu có
                        {isError && (
                            <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.
                            </Typography>
                        )} */}

                        {/* Links Forgot Password / Sign Up */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontSize: '0.9rem' }}>
                            <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                Forgot Password?
                            </Link>
                            <Link to="/login" style={{ color: 'red', fontWeight: 600, textDecoration: 'underline' }}>
                                Sign In
                            </Link>
                        </Box>

                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default Reg;
