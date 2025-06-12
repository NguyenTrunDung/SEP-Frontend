// hooks/queries/useBranches.js
import { useState, useEffect, useCallback } from 'react';
import { branchService } from '../../services/branchService';
import { message } from 'antd';

export const useBranches = (filters = {}) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await branchService.getBranches(filters.branchId || 1);
      // Đảm bảo branches là mảng
      const branchData = Array.isArray(response) ? response : [];
      console.log('Fetched branches in useBranches:', branchData);
      setBranches(branchData);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chi nhánh.');
      message.error('Không thể tải danh sách chi nhánh.');
    } finally {
      setLoading(false);
    }
  }, [filters.branchId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const setCurrentBranch = useCallback(async (branchId, callback) => {
    try {
      setLoading(true);
      const response = await branchService.setCurrentBranch(branchId);
      // Tìm chi nhánh trong branches dựa trên branchId
      const selectedBranch = branches.find(branch => branch.id === branchId) || {};
      if (callback) callback(selectedBranch); // Truyền object chi nhánh
      message.success('Đã chọn chi nhánh thành công.');
    } catch (err) {
      setError('Không thể chọn chi nhánh.');
      message.error('Không thể chọn chi nhánh.');
    } finally {
      setLoading(false);
    }
  }, [branches]);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    setCurrentBranch,
  };
};