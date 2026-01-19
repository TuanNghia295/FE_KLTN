import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { SiNike } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Banner1 from '../../assets/log-reg/1.jpg';
import { toast } from 'react-toastify';
import { useForgotPassword } from '../../services/authServices';

const ForgotPassword = () => {
  const { mutate: sendResetMail, isLoading } = useForgotPassword();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    }),
    onSubmit: (values) => {
      sendResetMail(
        { email: values.email },
        {
          onSuccess: () => {
            formik.resetForm();
          },
          onError: (error) => {
            const message = error?.response?.data?.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.';
            toast.error(message);
          },
        }
      );
    },
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Banner */}
      <Box
        sx={{
          display: { xs: 'none', xl: 'block' },
          width: '50%',
          position: 'relative',
        }}
      >
        <img
          src={Banner1}
          alt="Nike Banner"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Link to="/">
            <SiNike size={100} />
          </Link>
          <Typography variant="h3" fontWeight="bold" mt={3}>
            Forgot your password?
          </Typography>
          <Typography color="grey.300" mt={2} maxWidth="80%">
            Enter your email and we’ll send you a link to reset your password.
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box
        sx={{
          width: { xs: '100%', xl: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 420, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Link to="/" style={{ color: 'black' }}>
              <SiNike size={28} />
            </Link>
            <Typography fontWeight="bold" ml={2}>
              FORGOT PASSWORD
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              margin="normal"
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
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.4,
                bgcolor: 'black',
                '&:hover': { bgcolor: 'grey.800' },
              }}
            >
              {isLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Send reset link'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
