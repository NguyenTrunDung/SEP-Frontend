export const mockOrders = [
  {
    id: 'order-1',
    phone: '0933222222',
    userName: 'Nguyen Van A',
    items: [
      { id: '1', name: 'Bún xào bò', quantity: 1, price: 50000, subtotal: 50000 },
      { id: '2', name: 'Bún chả cá Nha Trang', quantity: 1, price: 50000, subtotal: 50000 },
    ],
    total: 105000,
    status: 'DELIVERED', // Order status
    paymentStatus: 'PAID', // Payment status
    createdAt: '2025-07-06T20:28:00+07:00',
    updatedAt: '2025-07-06T20:58:00+07:00',
  },
  {
    id: 'order-2',
    phone: '0987654321',
    userName: 'Tran Van B',
    items: [
      { id: '3', name: 'Phở bò', quantity: 2, price: 60000, subtotal: 120000 },
    ],
    total: 120000,
    status: 'READY', // Order status
    paymentStatus: 'NOT_PAID', // Payment status
    createdAt: '2025-07-06T19:15:00+07:00',
    updatedAt: '2025-07-06T19:45:00+07:00',
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


export const formatAmount = (amount) => {
  return `${amount.toLocaleString('vi-VN')}đ`;
};