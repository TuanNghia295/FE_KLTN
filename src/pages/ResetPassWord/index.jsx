import { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetPasswordWithToken } from '../../services/authServices';
import AxiosClient from '../../apis/axiosClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const { mutate: resetPassword, isPending } = useResetPasswordWithToken();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get('token');

    if (!tokenParam) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setToken(tokenParam);
  }, [location.search]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password || !passwordConfirmation) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    resetPassword(
      {
        token,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => {
          navigate('/login');
        },
        onError: (err) => {
          setError(err.response?.data?.message || 'Cập nhật mật khẩu thất bại.');
        },
      }
    );
  };

  useEffect(() => {
    const verifyResetToken = async () => {
      const token = new URLSearchParams(window.location.search).get('token');
      if (!token) return;

      try {
        await AxiosClient.get(`/auth/reset-password/verify?token=${token}`);
        // navigate('/login');
      } catch (error) {
        console.error('Verify failed', error);
        // navigate('/login');
      }
    };

    verifyResetToken();
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
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
            boxShadow: 3,
            width: '100%',
            maxWidth: 450,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 3,
            }}
          >
            ĐẶT LẠI MẬT KHẨU
          </Typography>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                setError('');
              }}
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
                '&.Mui-disabled': {
                  bgcolor: 'grey.500',
                  color: 'white',
                },
              }}
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
