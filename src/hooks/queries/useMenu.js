// hooks/queries/useMenu.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api/config';

export const useMenus = (filters = {}) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenusAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const branchId = localStorage.getItem('selectedBranch') ? JSON.parse(localStorage.getItem('selectedBranch')).id : '1';
      const date = filters.date || new Date().toISOString().split('T')[0];
      console.log('Fetching with params:', { date, branchId });

      // Fetch menus and foods by date
      const menuByDateResponse = await api.get(`/api/v1/public/menus/menu-by-date`, {
        params: { date, branchId },
      });
      console.log('Full menu by date response:', menuByDateResponse.data);
      const { foods: foodDtos } = menuByDateResponse.data.data || { foods: [] };

      // Fetch categories by date
      const categoriesResponse = await api.get(`/api/v1/public/menus/categories/by-date`, {
        params: { date, branchId },
      });
      console.log('Full categories response:', categoriesResponse.data);
      const categoryDtos = categoriesResponse.data.data || [];

      // Map foods to menu format
      const mappedMenus = foodDtos.map(food => {
        const categoryName = categoryDtos.find(c => c.id === food.categoryId)?.name || 'Chưa phân loại';
        console.log('Mapping food:', { food, categoryName });
        return {
          ID: food.id, // Sửa từ id
          BranchId: branchId,
          Date: date,
          dishName: food.name || 'Unnamed Dish',
          price: food.priceForGuest || 0,
          category: categoryName,
          image: food.imageUrl || 'https://via.placeholder.com/200x140', // Sửa từ imageUrl
          description: food.description || 'No description',
        };
      });

      setMenus(mappedMenus);
      setCategories(categoryDtos);
      setError(null);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setMenus([]);
      setCategories([]);
      setError('Failed to fetch menus from server. Details: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchMenusAndCategories();
  }, [fetchMenusAndCategories]);

  return {
    menus,
    categories,
    loading,
    error,
    refreshMenus: fetchMenusAndCategories,
  };
};