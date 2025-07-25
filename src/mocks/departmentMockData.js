export const departments = [
    {
        id: '1',
        name: 'Phòng hành chính',
        branchId: '1',
        createdAt: '12/07/2025 00:09',
        
    },
    {
        id: '2',
        name: 'Phòng kế hoạch',
        branchId: '1',
        createdAt: '12/07/2025 00:09',
        
    },
    {
        id: '3',
        name: 'Ban giám đốc',
        branchId: '1',
        createdAt: '12/07/2025 00:09',
       
    },
    {
        id: '4',
        name: 'Ban quản trị toàn nhà',
        branchId: '2',
        createdAt: '12/07/2025 00:09',
        
    },
    {
        id: '5',
        name: 'Tài Chính',
        branchId: '1',
        createdAt: '12/07/2025 00:10',
        
    },
    {
        id: '6',
        name: 'Hỗ Trợ Khách Hàng',
        branchId: '2',
        createdAt: '12/07/2025 00:15',
        
    }
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