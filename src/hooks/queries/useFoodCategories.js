// src/hooks/useFoodCategories.js
import { useState, useEffect, useCallback } from 'react';
import { foodCategoryService } from '../../services/foodCategoryService';
import { message } from 'antd';

export const useFoodCategories = (filters = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await foodCategoryService.getFoodCategories(filters.branchId);
      setCategories(response.data || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh mục món ăn.');
      message.error('Không thể tải danh mục món ăn.');
    } finally {
      setLoading(false);
    }
  }, [filters.branchId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
  };
};