import { mockMenus, mockFoods, mockFoodCategories, getFilteredMenus, getMenuById as getMenuFromMock } from '../mocks/menuData';
import { delay } from '../mocks/authData';

export const getMenus = async (filters = {}) => {
  await delay(500);
  return getFilteredMenus(filters);
};

export const getMenuById = async (id) => {
  await delay(300);
  const menu = getMenuFromMock(id);
  if (!menu) {
    throw new Error('Menu not found');
  }
  return menu;
};

export const createMenu = async (menuData) => {
  await delay(800);
  const food = mockFoods.find((f) => f.ID === menuData.foodId);
  if (!food) {
    throw new Error('Food not found');
  }
  const category = food.CategoryId
    ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Unknown', Image: null }
    : { Name: 'Unknown', Image: null };
  const newMenu = {
    ID: menuData.foodId,
    BranchId: menuData.BranchId, // Use numeric BranchId
    Date: menuData.Date,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    CreatedBy: menuData.CreatedBy || 'system',
    UpdatedBy: menuData.CreatedBy || 'system',
    TimeOfDay: menuData.TimeOfDay || null,
    IsTime: menuData.IsTime || false,
    TimeFrom: menuData.IsTime ? menuData.TimeFrom || null : null,
    TimeTo: menuData.IsTime ? menuData.TimeTo || null : null,
    dishName: food.Name,
    price: food.PriceForGuest,
    category: category.Name,
    image: food.Image,
    BranchId: food.BranchId, // Include BranchId
  };
  mockMenus.unshift(newMenu);
  return newMenu;
};

export const updateMenu = async (menuId, updatedData) => {
  await delay(500);
  const menu = getMenuFromMock(menuId);
  if (!menu) {
    throw new Error('Menu not found');
  }
  let food = mockFoods.find((f) => f.ID === menu.ID);
  if (updatedData.foodId && updatedData.foodId !== menu.ID) {
    food = mockFoods.find((f) => f.ID === updatedData.foodId);
    if (!food) {
      throw new Error('Food not found');
    }
    menu.ID = updatedData.foodId;
  }
  const category = food.CategoryId
    ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Unknown', Image: null }
    : { Name: 'Unknown', Image: null };
  Object.assign(menu, {
    BranchId: updatedData.BranchId || menu.BranchId,
    Date: updatedData.Date || menu.Date,
    CreatedAt: menu.CreatedAt,
    UpdatedAt: new Date().toISOString(),
    CreatedBy: menu.CreatedBy,
    UpdatedBy: updatedData.UpdatedBy || menu.UpdatedBy || 'system',
    TimeOfDay: updatedData.TimeOfDay !== undefined ? updatedData.TimeOfDay : menu.TimeOfDay,
    IsTime: updatedData.IsTime !== undefined ? updatedData.IsTime : menu.IsTime,
    TimeFrom: updatedData.IsTime ? updatedData.TimeFrom || null : null,
    TimeTo: updatedData.IsTime ? updatedData.TimeTo || null : null,
    dishName: food.Name,
    price: food.PriceForGuest,
    category: category.Name,
    image: food.Image,
    BranchId: food.BranchId, // Include BranchId
  });
  return menu;
};