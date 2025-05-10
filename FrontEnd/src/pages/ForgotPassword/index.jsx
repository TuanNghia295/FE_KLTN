import React, { Fragment } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { SiNike } from 'react-icons/si';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Banner1 from '../../assets/log-reg/1.jpg';
import { useResetPassword } from '../../services/authServices';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const { mutate: sendingResetPass, isPending, isError } = useResetPassword();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    }),
    onSubmit: (values) => {
      sendingResetPass(values.email, {
        onSuccess: () => {
          toast.success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
        },
        onError: (error) => {
          console.log('error mail', error);
          // toast.error(error.response?.data?.message || 'Gửi email thất bại');
        },
      });
    },
  });

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

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

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
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Reset Password'}
            </Button>

            {isError && (
              <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                Gửi email thất bại. Vui lòng kiểm tra lại thông tin.
              </Typography>
            )}
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
