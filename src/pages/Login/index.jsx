import { Fragment, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { FcGoogle } from 'react-icons/fc';
import { SiNike } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../../firebase';
import Banner1 from '../../assets/log-reg/1.jpg';
import { useLogin } from '../../services/authServices';

const auth = getAuth(app);

const Login = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const { mutate: login } = useLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Đăng nhập với Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      // Gửi firebaseUid đến backend
      login({ firebaseUid });
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsPending(false);
    }
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
              SIGN IN
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <TextField fullWidth margin="normal" id="email" name="email" label="Email" variant="outlined" required />

            {/* Password Input */}
            <TextField
              fullWidth
              margin="normal"
              id="password"
              name="password"
              label="Mật khẩu"
              variant="outlined"
              type={isShowPassword ? 'text' : 'password'}
              required
              InputProps={{
                endAdornment: (
                  <Button
                    aria-label={isShowPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setIsShowPassword(!isShowPassword)}
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
              disabled={isPending}
              sx={{
                mt: 3,
                py: 1.5,
                bgcolor: 'black',
                '&:hover': { bgcolor: 'grey.800' },
                '&.Mui-disabled': { bgcolor: 'grey.500', color: 'white' },
              }}
            >
              {isPending ? (
                <Fragment>
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                </Fragment>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            {/* Links Forgot Password / Sign Up */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontSize: '0.9rem' }}>
              <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Forgot Password?
              </Link>
              <Link to="/register" style={{ color: 'red', fontWeight: 600, textDecoration: 'underline' }}>
                Sign Up
              </Link>
            </Box>

            {/* Divider */}
            {/* <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'grey.300' }} />
              <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                Or continue with
              </Typography>
              <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'grey.300' }} />
            </Box> */}

            {/* Google Login Button */}
            {/* <Button
              fullWidth
              variant="outlined"
              startIcon={<FcGoogle size={24} />}
              sx={{
                py: 1.5,
                borderColor: 'grey.400',
                color: 'text.primary',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'grey.100',
                  borderColor: 'grey.500',
                },
              }}
            >
              Sign In with Google
            </Button> */}
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
