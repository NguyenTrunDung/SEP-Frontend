// src/mocks/walletData.js

// Mock wallet transactions database
export const mockWalletTransactions = [
    {
        id: 'wt1',
        userId: '5', 
        transactionType: 'PAYMENT',
        amount: 30000,
        balanceAfter: 99955000,
        description: 'Payment for order #00000152',
        orderId: '#00000152',
        createdAt: new Date('2025-05-28T00:59:00+07:00'),
    },
    {
        id: 'wt2',
        userId: '5',
        transactionType: 'PAYMENT',
        amount: 20000,
        balanceAfter: 99925000,
        description: 'Payment for order #00000154',
        orderId: '#00000154',
        createdAt: new Date('2025-06-02T01:54:00+07:00'),
    },
    {
        id: 'wt3',
        userId: '5',
        transactionType: 'PAYMENT',
        amount: 25000,
        balanceAfter: 99900000,
        description: 'Payment for order #00000155',
        orderId: '#00000155',
        createdAt: new Date('2025-06-02T01:56:00+07:00'),
    },
    {
        id: 'wt4',
        userId: '5',
        transactionType: 'PAYMENT',
        amount: 170000,
        balanceAfter: 99830000,
        description: 'Payment for order #00000157',
        orderId: '#00000157',
        createdAt: new Date('2025-06-02T02:10:00+07:00'),
    },
    {
        id: 'wt5',
        userId: '5',
        transactionType: 'DEPOSIT',
        amount: 100000,
        balanceAfter: 99980000,
        description: 'Deposit transaction',
        createdAt: new Date('2025-05-28T00:58:00+07:00'),
    },
    {
        id: 'wt6',
        userId: '2',
        transactionType: 'DEPOSIT',
        amount: 100000,
        balanceAfter: 99990000,
        description: 'Deposit transaction',
        createdAt: new Date('2025-06-02T02:08:00+07:00'),
    },
    {
        id: 'wt7',
        userId: '2',
        transactionType: 'DEPOSIT',
        amount: 100000000,
        balanceAfter: 99955000,
        description: 'Large deposit transaction',
        createdAt: new Date('2025-06-02T02:09:00+07:00'),
    },
];

// Utility function to format date and amount
export const formatDateTime = (date) => {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '/').replace(',', '');
};

export const formatAmount = (amount) => {
  return `${amount.toLocaleString('vi-VN')}đ`;
};