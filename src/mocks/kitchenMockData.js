export const kitchenOrders = [
  {
    id: 111,
    items: [{ name: 'Bún Rieu Chay', quantity: 'x1', note: 'Test đơn' }],
    createdAt: '12/07/2025 00:09',
  },
  {
    id: 155,
    items: [{ name: 'Cà phê đen đá/nóng', quantity: 'x1', note: '✔' }],
    createdAt: '12/07/2025 00:09',
  },
  {
    id: 236,
    items: [{ name: 'Chả cá bọc trứng cắt sốt cà (Suất ăn)', quantity: 'x2', note: '✔' }],
    createdAt: '12/07/2025 00:09',
  },
  {
    id: 10,
    items: [{ name: 'Hủ tiếu bò kho', quantity: 'x1', note: '✔' }],
    createdAt: '12/07/2025 00:09',
  },
  {
    id: 112,
    items: [{ name: 'Canh đầu cá hẻ', quantity: 'x2', note: '✔' }],
    createdAt: '12/07/2025 00:09',
  },
  {
    id: 999,
    createdAt: '12/07/2025 00:15',
    items: [
      { name: 'Bánh mì ốp la', quantity: 'x1', note: 'Không hành' },
      { name: 'Nước cam nguyên chất', quantity: 'x2', note: 'Ít đường' },
      { name: 'Mì xào bò', quantity: 'x1', note: '✔' },
    ],
  },
];


export const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};