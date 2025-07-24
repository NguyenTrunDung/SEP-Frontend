import { delay } from '../mocks/authData';

export const mockMenus = [
  {
    ID: 1,
    BranchId: 1,
    Date: '2025-07-23', // CẬP NHẬT NGÀY ĐỂ PHÙ HỢP VỚI NGÀY HIỆN TẠI
    dishName: 'Bánh mì pate',
    price: 20000,
    category: 'Ăn sáng',
    categoryId: 1, // THÊM categoryId ĐỂ NHẤT QUÁN
    image: 'https://via.placeholder.com/200x140',
    description: 'Bánh mì pate đặc biệt với nhân thịt và rau củ'
  },
  {
    ID: 2,
    BranchId: 1,
    Date: '2025-07-23',
    dishName: 'Phở bò',
    price: 50000,
    category: 'Ăn trưa',
    categoryId: 2,
    image: 'https://via.placeholder.com/200x140',
    description: 'Phở bò nấu theo phong cách Hà Nội'
  },
  {
    ID: 3,
    BranchId: 1,
    Date: '2025-07-23',
    dishName: 'Cơm chiên dương châu',
    price: 45000,
    category: 'Ăn trưa',
    categoryId: 2,
    image: 'https://via.placeholder.com/200x140',
    description: 'Cơm chiên với tôm, trứng và rau củ'
  },
  {
    ID: 4,
    BranchId: 1,
    Date: '2025-07-24',
    dishName: 'Chè ba màu',
    price: 15000,
    category: 'Tráng miệng',
    categoryId: 3,
    image: 'https://via.placeholder.com/200x140',
    description: 'Chè ba màu ngọt mát'
  }
];

export const mockFoodCategories = [
  { ID: 1, Name: 'Ăn sáng', Image: 'https://via.placeholder.com/100x100' },
  { ID: 2, Name: 'Ăn trưa', Image: 'https://via.placeholder.com/100x100' },
  { ID: 3, Name: 'Tráng miệng', Image: 'https://via.placeholder.com/100x100' }
];

export const getFilteredMenus = async (filters = {}) => {
  await delay(500);
  return mockMenus.filter(menu => !filters.date || menu.Date === filters.date);
};

export const getMenuById = async (id) => {
  await delay(300);
  return mockMenus.find(menu => menu.ID === id) || null;
};