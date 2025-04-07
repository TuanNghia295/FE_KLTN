import React from 'react';

const ChooseSizeList = ({ sizeDefault, sizeChoose, onChange }) => {
  return (
    <select value={sizeDefault} onChange={onChange}>
    {Array.isArray(sizeChoose) &&
      sizeChoose.map((size, index) => (
        <option key={index} value={size.size}>
          {size.size}
        </option>
      ))}
    </select>
  );
};

export default ChooseSizeList;
