export const formatCash = (cash) => {
  if (cash === null || cash === undefined) return '';

  const number = Number(cash);
  if (isNaN(number)) return cash;

  return number.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};
