// useBranches.js
import { useState, useEffect } from 'react';
import { getFilteredBranches } from '../../mocks/branchData'; // Đảm bảo đường dẫn đúng

export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(getFilteredBranches());
        }, 500); // Giả lập độ trễ mạng
      });
      setBranches(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    error,
  };
};