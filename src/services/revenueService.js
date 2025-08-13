import api, { environment } from './api/config';

const normalizeBranchId = (branchId) => {
  const resolvedBranchId =
    branchId !== undefined && branchId !== null
      ? branchId
      : environment.multiTenant.getCurrentBranchId();
  const id =
    resolvedBranchId !== undefined && resolvedBranchId !== null
      ? String(resolvedBranchId)
      : '1';
  if (environment.features.enableLogging) {
    console.log(`🔄 Normalized branchId: ${id}`);
  }
  return id;
};

export const revenueService = {
  async getRevenueByDay(branchId, date, options = {}) {
    const normalizedBranchId = normalizeBranchId(branchId);
    const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    try {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching revenue by day for branch: ${normalizedBranchId}, date: ${formattedDate}`);
      }
      const response = await api.get(`/api/v1/public/revenues/Branch/${normalizedBranchId}/Day/${formattedDate}`, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Received revenue by day for branch ${normalizedBranchId}:`, JSON.stringify(response.data, null, 2));
      }
      // Handle both response.data and response.data.data structures
      const revenueData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!revenueData.length) {
        console.warn(`⚠️ Empty revenue data for branch ${normalizedBranchId}, date: ${formattedDate}`);
        return [{ order: 0, total: 0, quantityFood: 0, chartOrders: [] }];
      }
      return revenueData;
    } catch (error) {
      console.error(
        `❌ Failed to fetch revenue by day for branch ${normalizedBranchId}, date: ${formattedDate}:`,
        error.message,
        error.response?.data || error
      );
      throw error; // Re-throw to let useQuery handle error state
    }
  },

  async getRevenueByWeek(branchId, date, options = {}) {
    const normalizedBranchId = normalizeBranchId(branchId);
    const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    try {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching revenue by week for branch: ${normalizedBranchId}, date: ${formattedDate}`);
      }
      const response = await api.get(`/api/v1/public/revenues/Branch/${normalizedBranchId}/Week/${formattedDate}`, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Received revenue by week for branch ${normalizedBranchId}:`, JSON.stringify(response.data, null, 2));
      }
      const revenueData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!revenueData.length) {
        console.warn(`⚠️ Empty revenue data for branch ${normalizedBranchId}, date: ${formattedDate}`);
        return [{ order: 0, total: 0, quantityFood: 0, chartOrders: [] }];
      }
      return revenueData;
    } catch (error) {
      console.error(
        `❌ Failed to fetch revenue by week for branch ${normalizedBranchId}:`,
        error.message,
        error.response?.data || error
      );
      throw error;
    }
  },

  async getRevenueByMonth(branchId, date, options = {}) {
    const normalizedBranchId = normalizeBranchId(branchId);
    const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    try {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching revenue by month for branch: ${normalizedBranchId}, date: ${formattedDate}`);
      }
      const response = await api.get(`/api/v1/public/revenues/Branch/${normalizedBranchId}/Month/${formattedDate}`, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Received revenue by month for branch ${normalizedBranchId}:`, JSON.stringify(response.data, null, 2));
      }
      const revenueData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!revenueData.length) {
        console.warn(`⚠️ Empty revenue data for branch ${normalizedBranchId}, date: ${formattedDate}`);
        return [{ order: 0, total: 0, quantityFood: 0, chartOrders: [] }];
      }
      return revenueData;
    } catch (error) {
      console.error(
        `❌ Failed to fetch revenue by month for branch ${normalizedBranchId}:`,
        error.message,
        error.response?.data || error
      );
      throw error;
    }
  },

  async getRevenueByYear(branchId, date, options = {}) {
    const normalizedBranchId = normalizeBranchId(branchId);
    const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    try {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching revenue by year for branch: ${normalizedBranchId}, date: ${formattedDate}`);
      }
      const response = await api.get(`/api/v1/public/revenues/Branch/${normalizedBranchId}/Year/${formattedDate}`, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Received revenue by year for branch ${normalizedBranchId}:`, JSON.stringify(response.data, null, 2));
      }
      const revenueData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!revenueData.length) {
        console.warn(`⚠️ Empty revenue data for branch ${normalizedBranchId}, date: ${formattedDate}`);
        return [{ order: 0, total: 0, quantityFood: 0, chartOrders: [] }];
      }
      return revenueData;
    } catch (error) {
      console.error(
        `❌ Failed to fetch revenue by year for branch ${normalizedBranchId}:`,
        error.message,
        error.response?.data || error
      );
      throw error;
    }
  },
};