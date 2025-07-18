export const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const mockFeedbacks = [
  {
    id: 111,
    orderId: 'ORD111',
    customerName: 'Nguyen Van A',
    rating: 4,
    content: 'Test đơn - ngon!',
    createdAt: formatDateTime(new Date('2025-07-12 00:09')),
    reply: 'Cảm ơn bạn đã đánh giá!',
    items: [{ name: 'Phở bò' }, { name: 'Nước chanh' }],
  },
  {
    id: 155,
    orderId: 'ORD155',
    customerName: 'Nguyen Thi B',
    rating: 3,
    content: 'Cà phê tạm ổn',
    createdAt: formatDateTime(new Date('2025-07-12 00:09')),
    items: [{ name: 'Cà phê sữa' }],
  },
  {
    id: 236,
    orderId: 'ORD236',
    customerName: 'Đoàn Văn C',
    rating: 5,
    content: 'Chả cá tuyệt vời',
    createdAt: formatDateTime(new Date('2025-07-12 00:09')),
    reply: 'Chúng tôi rất vui khi bạn hài lòng!',
    items: [{ name: 'Chả cá Lã Vọng' }, { name: 'Bún' }],
  },
  {
    id: 10,
    orderId: 'ORD010',
    customerName: 'Khách 10',
    rating: 2,
    content: 'Hủ tiếu không ngon',
    createdAt: formatDateTime(new Date('2025-07-12 00:09')),
    items: [{ name: 'Hủ tiếu nam vang' }],
  },
  {
    id: 112,
    orderId: 'ORD112',
    customerName: 'Khách 112',
    rating: 4,
    content: 'Canh ngon',
    createdAt: formatDateTime(new Date('2025-07-12 00:09')),
    items: [{ name: 'Canh chua cá lóc' }],
  },
  {
    id: 999,
    orderId: 'ORD999',
    customerName: 'Khách 999',
    rating: 3,
    content: 'Bánh mì không hành, nước cam ít đường',
    createdAt: formatDateTime(new Date('2025-07-12 00:15')),
    items: [{ name: 'Bánh mì pate' }, { name: 'Nước cam' }],
  },
];