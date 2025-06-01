import { mockBranches } from './branchData';
export const mockFoodCategories = [
  {
    ID: '1',
    Name: 'Salad',
    BranchId: '1', // Updated to match ID from branchData.js
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Image: '/images/salad.jpg',
    Sort: 1,
    Active: true,
  },
  {
    ID: '2',
    Name: 'Món Chính',
    BranchId: '2', // Updated to match ID from branchData.js
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Image: '/images/main.jpg',
    Sort: 2,
    Active: true,
  },
  {
    ID: '3',
    Name: 'Súp',
    BranchId: '1', // Updated to match ID from branchData.js
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Image: '/images/soup.jpg',
    Sort: 3,
    Active: true,
  },
];

// Mock Foods data (based on HOMMS.dbo.Foods)
export const mockFoods = [
  {
    ID: '1',
    Name: 'Salad Gà',
    BranchId: '1', // Updated to match ID from branchData.js
    CategoryId: '1',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Salad tươi với gà nướng',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: true,
    PriceForGuest: 45000.0,
    PriceForPatient: 7.99,
    PriceForStaff: 6.99,
    DiseaseCategoryId: null,
    Image: '/images/ck.jpg',
    Sort: 1,
  },
  {
    ID: '2',
    Name: 'Thịt Bò Xào',
    BranchId: '2', // Updated to match ID from branchData.js
    CategoryId: '2',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Thịt bò xào với rau củ',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: false,
    PriceForGuest: 35000.000,
    PriceForPatient: 9.99,
    PriceForStaff: 8.99,
    DiseaseCategoryId: null,
    Image: '/images/fry.jpg',
    Sort: 2,
  },
  {
    ID: '3',
    Name: 'Súp Rau',
    BranchId: '1', // Updated to match ID from branchData.js
    CategoryId: '3',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Súp rau củ tốt cho sức khỏe',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: true,
    PriceForGuest: 23000.000,
    PriceForPatient: 4.99,
    PriceForStaff: 4.49,
    DiseaseCategoryId: null,
    Image: '/images/sp.jpg',
    Sort: 3,
  },
  {
    ID: '4',
    Name: 'Cơm Sườn',
    BranchId: '2', // Updated to match ID from branchData.js
    CategoryId: '2',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Sườn nướng với cơm',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: false,
    PriceForGuest: 50000.000,
    PriceForPatient: 9.99,
    PriceForStaff: 8.99,
    DiseaseCategoryId: null,
    Image: '/images/com.jpg',
    Sort: 2,
  },
];

// Mock Menus data (based on HOMMS.dbo.Menus)

export const mockMenus = [
  {
    ID: '1',
    BranchId: '1',
    Date: '2025-06-01', // Added for June 1, 2025
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Lunch',
    IsTime: true,
    TimeFrom: '12:00:00',
    TimeTo: '14:00:00',
    FoodId: '1', // Salad Gà
  },
  {
    ID: '2',
    BranchId: '2',
    Date: '2025-06-01', // Added for June 1, 2025
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Dinner',
    IsTime: true,
    TimeFrom: '18:00:00',
    TimeTo: '20:00:00',
    FoodId: '2', // Thịt Bò Xào
  },
  {
    ID: '3',
    BranchId: '1',
    Date: '2025-06-01', // Added for June 1, 2025
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Breakfast',
    IsTime: false,
    TimeFrom: null,
    TimeTo: null,
    FoodId: '3', // Súp Rau
  },
  {
    ID: '4',
    BranchId: '2',
    Date: '2025-06-01', // Added for June 1, 2025
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Dinner',
    IsTime: true,
    TimeFrom: '18:00:00',
    TimeTo: '20:00:00',
    FoodId: '4', // Cơm Sườn
  },
];

// Helper function to get menus with optional filtering
export const getFilteredMenus = (filters = {}) => {
  let result = [...mockMenus];

  if (filters.date) {
    result = result.filter((menu) => menu.Date === filters.date);
  }

  if (filters.branchId) {
    result = result.filter((menu) => menu.BranchId === filters.branchId);
  }

  return result.map((menu) => {
    const food = mockFoods.find((f) => f.ID === menu.FoodId) || {
      Name: 'Món Không Xác Định',
      PriceForGuest: 0,
      CategoryId: null,
      Image: null,
      Description: 'Không có mô tả',
    };
    const category = food.CategoryId
      ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Không Xác Định', Image: null }
      : { Name: 'Không Xác Định', Image: null };
    return {
      ...menu,
      dishName: food.Name,
      price: food.PriceForGuest,
      category: category.Name,
      image: food.Image,
      description: food.Description,
    };
  });
};

export const getMenuById = (menuId) => {
  const menu = mockMenus.find((m) => m.ID === menuId);
  if (!menu) {
    return null;
  }
  const food = mockFoods.find((f) => f.ID === menu.FoodId) || {
    Name: 'Món Không Xác Định',
    PriceForGuest: 0,
    CategoryId: null,
    Image: null,
    Description: 'Không có mô tả',
  };
  const category = food.CategoryId
    ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Không Xác Định', Image: null }
    : { Name: 'Không Xác Định', Image: null };
  return {
    ...menu,
    dishName: food.Name,
    price: food.PriceForGuest,
    category: category.Name,
    image: food.Image,
    description: food.Description,
  };
};