import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { useUpdatePassword } from '../../services/authServices';
import app from '../../firebase';

const auth = getAuth(app);

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: updatePassword } = useUpdatePassword();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const actionCode = query.get('oobCode');
    const continueUrl = query.get('continueUrl');

    console.log('Action code:', actionCode);
    console.log('Continue URL:', continueUrl);

    if (!actionCode || !continueUrl) {
      setError('Liên kết không hợp lệ.');
      return;
    }

    // Giải mã continueUrl để lấy email
    try {
      const decodedUrl = decodeURIComponent(continueUrl);
      const emailParam = new URL(decodedUrl).searchParams.get('email');
      console.log('Extracted email:', emailParam);
      setEmail(emailParam);
    } catch {
      console.error('Error decoding continueUrl');
      setError('Liên kết không hợp lệ.');
    }

    // Xác minh action code
    verifyPasswordResetCode(auth, actionCode).catch(() => {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
    });
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const query = new URLSearchParams(location.search);
    const actionCode = query.get('oobCode');

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);

      // Đồng bộ mật khẩu với MongoDB
      updatePassword(
        { email, newPassword },
        {
          onSuccess: () => {
            toast.success('Mật khẩu đã được cập nhật! Vui lòng đăng nhập lại.');
            navigate('/login');
          },
          onError: (updateError) => {
            setError(updateError.response?.data?.message || 'Cập nhật mật khẩu thất bại.');
          },
        }
      );
    } catch (err) {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsPending(false);
    }
  };

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
            maxWidth: '450px',
          }}
        >
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            ĐẶT LẠI MẬT KHẨU
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              id="newPassword"
              name="newPassword"
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={Boolean(error)}
              helperText={error}
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
              {isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
