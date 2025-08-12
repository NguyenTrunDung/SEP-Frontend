export const deliveryOrders = [
  {
    id: 1,
    tenKhachHang: 'Nguyễn Văn A',
    ngayNhan: '28/07/2025 16:00',
    soDienThoai: '0905123456',
    diaChi: '123 Đường ABC, Quận 1, TP.HCM',
  },
  {
    id: 2,
    tenKhachHang: 'Trần Thị B',
    ngayNhan: '28/07/2025 16:30',
    soDienThoai: '0916234567',
    diaChi: '456 Đường XYZ, Quận 3, TP.HCM',
  },
  {
    id: 3,
    tenKhachHang: 'Lê Văn C',
    ngayNhan: '28/07/2025 17:00',
    soDienThoai: '0987345678',
    diaChi: '789 Đường DEF, Quận 5, TP.HCM',
  },
  {
    id: 4,
    tenKhachHang: 'Phạm Thị D',
    ngayNhan: '28/07/2025 17:30',
    soDienThoai: '0978456789',
    diaChi: '101 Đường GHI, Quận 7, TP.HCM',
  },
  {
    id: 5,
    tenKhachHang: 'Hoàng Văn E',
    ngayNhan: '28/07/2025 18:00',
    soDienThoai: '0969567890',
    diaChi: '202 Đường JKL, Quận 10, TP.HCM',
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