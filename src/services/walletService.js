// src/services/walletService.js
import { mockWalletTransactions } from '../mocks/walletData';
import { delay } from '../mocks/authData'; // Sử dụng delay từ authData
import api, { environment } from './api/config';

export const walletService = {
     /**
   * Get deposit history for a user by branch
   * GET /api/v1/userWallet/{userId}/deposit-history
   */
  async getDepositHistory(userId, branchIdOverride = null) {
    try {
      const branchId = branchIdOverride || environment.multiTenant.getCurrentBranchId() || '1';
      if (!userId || !branchId) {
        throw new Error(`Invalid userId (${userId}) or branchId (${branchId})`);
      }
      if (environment.features.enableLogging) {
        console.log(`📡 Calling getDepositHistory for userId: ${userId}, branchId: ${branchId}`);
      }
      const response = await api.get(`/api/v1/userWallet/${userId}/deposit-history`, {
        headers: { 'X-Branch-Id': branchId },
        params: { pageNumber: 1, pageSize: 1000 }, // Lấy tất cả giao dịch
      });
      const transactions = Array.isArray(response.data?.data?.transactions)
        ? response.data.data.transactions
        : Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (environment.features.enableLogging) {
        console.log('✅ Fetched deposit history:', transactions);
      }
      return transactions;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch deposit history:', error.message, error.response?.data);
      }
      if (error.response?.status === 404) {
        return []; // Ví chưa có giao dịch
      }
      throw error;
    }
  },

  /**
   * Get purchase history for a user by branch
   * GET /api/v1/userWallet/{userId}/purchase-history
   */
  async getPurchaseHistory(userId, branchIdOverride = null) {
    try {
      const branchId = branchIdOverride || environment.multiTenant.getCurrentBranchId() || '1';
      if (!userId || !branchId) {
        throw new Error(`Invalid userId (${userId}) or branchId (${branchId})`);
      }
      if (environment.features.enableLogging) {
        console.log(`📡 Calling getPurchaseHistory for userId: ${userId}, branchId: ${branchId}`);
      }
      const response = await api.get(`/api/v1/userWallet/${userId}/purchase-history`, {
        headers: { 'X-Branch-Id': branchId },
        params: { pageNumber: 1, pageSize: 1000 }, // Lấy tất cả giao dịch
      });
      const transactions = Array.isArray(response.data?.data?.transactions)
        ? response.data.data.transactions
        : Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (environment.features.enableLogging) {
        console.log('✅ Fetched purchase history:', transactions);
      }
      return transactions;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch purchase history:', error.message, error.response?.data);
      }
      if (error.response?.status === 404) {
        return []; // Ví chưa có giao dịch
      }
      throw error;
    }
  },

  /**
   * Get wallet balance for a user
   * GET /api/v1/userWallet/{userId}
   */
  async getWalletBalance(userId, branchIdOverride = null) {
    try {
      const branchId = branchIdOverride || environment.multiTenant.getCurrentBranchId() || '1';
      if (!userId || !branchId) {
        throw new Error(`Invalid userId (${userId}) or branchId (${branchId})`);
      }
      if (environment.features.enableLogging) {
        console.log(`📡 Calling getWalletBalance for userId: ${userId}, branchId: ${branchId}`);
      }
      const response = await api.get(`/api/v1/userWallet/${userId}`, {
        headers: { 'X-Branch-Id': branchId },
      });
      const balance = response.data?.data?.balance || 0;
      if (environment.features.enableLogging) {
        console.log('✅ Fetched wallet balance:', balance);
      }
      return balance;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch wallet balance:', error.message, error.response?.data);
      }
      if (error.response?.status === 404) {
        return 0; // Ví chưa được tạo
      }
      throw error;
    }
  },
    /**
     * Get wallet transactions for a user
     * GET /api/wallet/transactions
     */
    async getWalletTransactions(userId) {
        try {
            await delay(500);
            const transactions = mockWalletTransactions.filter(tx => tx.userId === userId);
            if (environment.features.enableLogging) {
                console.log('✅ Fetched wallet transactions for user:', userId);
            }
            return transactions;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch wallet transactions:', error.message);
            }
            throw error;
        }
    },

    /**
     * Add a new transaction (deposit or payment)
     * POST /api/wallet/transaction
     */
    async addTransaction(transactionData) {
        try {
            await delay(800);
            const newTransaction = {
                id: `wt${Date.now()}`,
                userId: transactionData.userId,
                transactionType: transactionData.transactionType,
                amount: transactionData.amount,
                balanceAfter: transactionData.balanceAfter,
                description: transactionData.description || '',
                orderId: transactionData.orderId || null,
                createdAt: new Date().toISOString(),
            };
            mockWalletTransactions.unshift(newTransaction);
            if (environment.features.enableLogging) {
                console.log('✅ Added new transaction:', newTransaction.id);
            }
            return newTransaction;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to add transaction:', error.message);
            }
            throw error;
        }
    },
};