import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { useUpdatePassword } from '../../services/authServices';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: updatePassword } = useUpdatePassword();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const actionCode = query.get('oobCode');

    if (!actionCode) {
      setError('Liên kết không hợp lệ.');
      return;
    }

    // Xác minh action code
    const auth = getAuth();
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
      const auth = getAuth();
      const email = await verifyPasswordResetCode(auth, actionCode);
      await confirmPasswordReset(auth, actionCode, newPassword);

      // Đồng bộ mật khẩu với MongoDB
      updatePassword(
        { email, newPassword },
        {
          onSuccess: () => {
            toast.success('Mật khẩu đã được cập nhật! Vui lòng đăng nhập lại.');
            navigate('/login');
          },
          onError: (error) => {
            setError(error.response?.data?.message || 'Cập nhật mật khẩu thất bại.');
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
