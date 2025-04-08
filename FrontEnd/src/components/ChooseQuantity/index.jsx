import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

const ChooseQuantity = ({ quantity }) => {
  const [newQuantity, setNewQuantity] = useState(quantity);

  const increase = () => {
    if (newQuantity < 200) setNewQuantity(newQuantity + 1);
  };

  const decrease = () => {
    if (newQuantity > 1) setNewQuantity(newQuantity - 1);
  };

  const handleChange = (e) => {
    const value = e.target.value;

    // Cho phép giá trị trống hoặc số hợp lệ
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 200)) {
      setNewQuantity(value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleBlur = () => {
    // Đặt giá trị mặc định nếu người dùng để trống hoặc nhập sai
    if (newQuantity === '' || isNaN(newQuantity) || newQuantity < 1) {
      setNewQuantity(1);
    } else if (newQuantity > 200) {
      setNewQuantity(200);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Button
        variant="outlined"
        size="small"
        onClick={decrease}
        disabled={newQuantity <= 1}
        sx={{ minWidth: '36px', padding: 0 }}
      >
        -
      </Button>
      <TextField
        type="text"
        value={newQuantity}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{
          min: 1,
          max: 200,
          style: { textAlign: 'center' },
        }}
        size="small"
        sx={{ width: '60px' }}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={increase}
        disabled={newQuantity >= 200}
        sx={{ minWidth: '36px', padding: 0 }}
      >
        +
      </Button>
    </Box>
  );
};

export default ChooseQuantity;
