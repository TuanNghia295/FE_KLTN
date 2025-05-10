// Tạo một hook để định dạng số tiền thành tiền tệ vnd
export const formatCash = (cash) => {
  if (typeof cash !== 'number') return cash;
  return cash.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};
