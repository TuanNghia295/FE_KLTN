import React, { useState } from 'react';

const ChooseQuantity = ({ quantity}) => {
  const [newQuantity, setNewQuantity] = useState(quantity)

  const increase = () => {
    if (newQuantity < 200 ) setNewQuantity(newQuantity + 1);
  };

  const decrease = () => {
    if (newQuantity >= 1 ) setNewQuantity(newQuantity - 1);
  };

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setNewQuantity(value);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={decrease}>-</button>
      <input
        type="number"
        value={newQuantity}
        onChange={handleChange}
        style={{ width: 50, textAlign: 'center' }}
      />
      <button onClick={increase}>+</button>
    </div>
  );
};

export default ChooseQuantity;
