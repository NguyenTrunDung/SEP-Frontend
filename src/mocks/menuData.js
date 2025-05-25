// menuData.js
// Mock Food_Categories data (based on HOMMS.dbo.Food_Categories)
export const mockFoodCategories = [
  {
    ID: '1',
    Name: 'Salads',
    BranchId: 'branch1',
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
    Name: 'Main Courses',
    BranchId: 'branch2',
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
    Name: 'Soups',
    BranchId: 'branch1',
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
    Name: 'Chicken Salad',
    BranchId: 'branch1',
    CategoryId: '1',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Fresh salad with grilled chicken',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: true,
    PriceForGuest: 8.99,
    PriceForPatient: 7.99,
    PriceForStaff: 6.99,
    DiseaseCategoryId: null,
    Image: '/images/ck.jpg',
    Sort: 1,
  },
  {
    ID: '2',
    Name: 'Beef Stir Fry',
    BranchId: 'branch2',
    CategoryId: '2',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Stir-fried beef with vegetables',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: false,
    PriceForGuest: 10.99,
    PriceForPatient: 9.99,
    PriceForStaff: 8.99,
    DiseaseCategoryId: null,
    Image: '/images/fry.jpg',
    Sort: 2,
  },
  {
    ID: '3',
    Name: 'Vegetable Soup',
    BranchId: 'branch1',
    CategoryId: '3',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Healthy vegetable soup',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: true,
    PriceForGuest: 5.99,
    PriceForPatient: 4.99,
    PriceForStaff: 4.49,
    DiseaseCategoryId: null,
    Image: '/images/sp.jpg',
    Sort: 3,
  },
  {
    ID: '4',
    Name: 'Cơm sườn',
    BranchId: 'branch2',
    CategoryId: '2',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    Description: 'Grilled pork chop with rice',
    IsSetDish: false,
    IsAddOn: false,
    ForPatient: false,
    PriceForGuest: 10.99,
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
    BranchId: 'branch1',
    Date: '2025-05-24',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: null,
    IsTime: true,
    TimeFrom: '12:00:00',
    TimeTo: '14:00:00',
    FoodId: '1', // Link to Chicken Salad
  },
  {
    ID: '2',
    BranchId: 'branch2',
    Date: '2025-05-26',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Dinner',
    IsTime: true,
    TimeFrom: '18:00:00',
    TimeTo: '20:00:00',
    FoodId: '2', // Link to Beef Stir Fry
  },
  {
    ID: '3',
    BranchId: 'branch1',
    Date: '2025-05-25',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Breakfast',
    IsTime: false,
    TimeFrom: null,
    TimeTo: null,
    FoodId: '3', 
  },
  {
    ID: '4',
    BranchId: 'branch2',
    Date: '2025-05-25',
    CreatedAt: '2025-05-19T10:00:00',
    UpdatedAt: '2025-05-19T10:00:00',
    CreatedBy: 'user1',
    UpdatedBy: 'user1',
    TimeOfDay: 'Dinner',
    IsTime: true,
    TimeFrom: '18:00:00',
    TimeTo: '20:00:00',
    FoodId: '4', 
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
      Name: 'Unknown Dish',
      PriceForGuest: 0,
      CategoryId: null,
      Image: null,
      Description: 'No description available',
    };
    const category = food.CategoryId
      ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Unknown', Image: null }
      : { Name: 'Unknown', Image: null };
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
    Name: 'Unknown Dish',
    PriceForGuest: 0,
    CategoryId: null,
    Image: null,
    Description: 'No description available',
  };
  const category = food.CategoryId
    ? mockFoodCategories.find((c) => c.ID === food.CategoryId) || { Name: 'Unknown', Image: null }
    : { Name: 'Unknown', Image: null };
  return {
    ...menu,
    dishName: food.Name,
    price: food.PriceForGuest,
    category: category.Name,
    image: food.Image,
    description: food.Description,
  };
};