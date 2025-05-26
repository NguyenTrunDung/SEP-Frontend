import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api/config';
import { getFilteredMenus } from '../../mocks/menuData';

export const useMenus = (filters = {}) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setIsUsingMockData(false); // Reset to prioritize BE data
      const response = await api.get('/menus', { params: filters });
      setMenus(response.data);
      setError(null);
    } catch (err) {
      // Fall back to mock data on failure
      try {
        const mockData = getFilteredMenus(filters);
        setMenus(mockData);
        setIsUsingMockData(true);
        setError(); //'Failed to fetch menus from server, using offline data.'
      } catch (mockErr) {
        setError(); //'Failed to fetch menus and load offline data.'
      }
    } finally {
      setLoading(false);
    }
  }, [filters.date]); // Dependency on filters.date

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    isUsingMockData, // Expose for UI feedback
    refreshMenus: fetchMenus,
  };
};