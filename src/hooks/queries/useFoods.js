import { useState, useEffect, useCallback } from 'react';
import { foodService } from '../../services/foodService';
import { message } from 'antd';

export const useFoods = (filters = {}) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await foodService.getFoods(filters.branchId);
      setFoods(response || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải món ăn.');
      message.error('Không thể tải món ăn.');
    } finally {
      setLoading(false);
    }
  }, [filters.branchId]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  return {
    foods,
    loading,
    error,
    refreshFoods: fetchFoods,
  };
};