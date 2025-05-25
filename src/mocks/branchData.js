// branchData.js
export const mockBranches = [
  {
    ID: '1',
    Name: 'Becamex',
    Address: 'Binh Duong Avenue, Go Cat area',
  },
  {
    ID: '2',
    Name: 'Hoan My Cuu Long Hospital Canteen',
    Address: 'Can Tho',
  },
  {
    ID: '3',
    Name: 'Coteccons',
    Address: 'Ho Chi Minh City',
  },
];

// Hàm để lấy danh sách chi nhánh
export const getFilteredBranches = () => {
  return mockBranches;
};