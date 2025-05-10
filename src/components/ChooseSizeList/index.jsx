import React, { useState } from 'react';
import { MenuItem, Select, Typography } from '@mui/material';

const ChooseSizeList = ({ sizeDefault, sizeChoose, onChange }) => {
  const [selectedSize, setSelectedSize] = useState(sizeDefault); // State để lưu size đã chọn

  return (
    <div className="w-full">
      <Select
        size="small"
        value={selectedSize}
        onChange={(e) => {
          const selectedVariation = sizeChoose.find((variation) => variation.size === e.target.value);
          setSelectedSize(e.target.value); // Cập nhật state
          onChange(selectedVariation); // Truyền toàn bộ thông tin của biến thể
        }}
        displayEmpty
        fullWidth
      >
        {Array.isArray(sizeChoose) &&
          sizeChoose.map((variation, index) => (
            <MenuItem key={index} value={variation.size}>
              {variation.size}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
};

export default ChooseSizeList;
