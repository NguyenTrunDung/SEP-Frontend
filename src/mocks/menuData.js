// mocks/menuData.js
import { delay } from '../mocks/authData';

export const mockMenus = [
  { ID: 1, BranchId: 1, Date: '2025-06-11', dishName: 'Bánh mì', price: 20000, category: 'Ăn sáng', image: 'https://via.placeholder.com/200x140', description: 'Bánh mì đặc biệt' },
  // Thêm các mục khác nếu cần
];

export const mockFoods = [
  { ID: 1, Name: 'Bánh mì', PriceForGuest: 20000, CategoryId: 1, Image: 'https://via.placeholder.com/200x140', description: 'Bánh mì đặc biệt' },
];

export const mockFoodCategories = [
  { ID: 1, Name: 'Ăn sáng', Image: 'https://via.placeholder.com/100x100' },
];

export const getFilteredMenus = async (filters = {}) => {
  await delay(500);
  return mockMenus.filter(menu => !filters.date || menu.Date === filters.date);
};

export const getMenuById = async (id) => {
  await delay(300);
  return mockMenus.find(menu => menu.ID === id) || null;
};