// src/services/walletService.js
import { mockWalletTransactions } from '../mocks/walletData';
import { delay } from '../mocks/authData'; // Sử dụng delay từ authData
import api, { environment } from './api/config';

export const walletService = {
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