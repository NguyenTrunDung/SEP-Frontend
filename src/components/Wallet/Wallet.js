import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin, message } from 'antd';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { useTimezone } from '../../hooks/useTimezone';

// Legacy format function for compatibility (can be removed after full migration)
const formatDateTime = (date) => {
  const formatted = new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '/').replace(',', '');
  console.log('📅 Formatted date:', date, '->', formatted);
  return formatted;
};

const formatAmount = (amount) => {
  if (amount == null || isNaN(amount)) {
    console.warn('⚠️ Invalid amount for formatting:', amount);
    return '0đ';
  }
  const formatted = `${Number(amount).toLocaleString('vi-VN')}đ`;
  console.log('💵 Formatted amount:', amount, '->', formatted);
  return formatted;
};

const Wallet = ({ visible, onClose }) => {
  const { user } = useAuth();
  const { format } = useTimezone();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!visible || !user?.id) {
        console.log('⛔ Skipped fetching: missing visible or userId', { visible, userId: user?.id });
        if (visible) {
          message.error('Không tìm thấy thông tin người dùng');
        }
        return;
      }

      if (![ROLES.NURSE, ROLES.DOCTOR].includes(user.role)) {
        console.log('⛔ User role not allowed to view wallet:', user.role);
        message.error('Vai trò của bạn không được phép xem ví');
        return;
      }

      setLoading(true);
      try {
        console.log(`📡 Fetching wallet data for userId: ${user.id}, role: ${user.role}, branchId: ${user.branchId || 'default'}`);
        const branchId = user.branchId || null;
        const [depositData, balanceData] = await Promise.all([
          walletService.getDepositHistory(user.id, branchId),
          walletService.getWalletBalance(user.id, branchId),
        ]);

        console.log('💰 balanceData from API:', balanceData);

        const combinedTransactions = depositData.map(tx => ({
          ...tx,
          balanceAfter: tx.balanceAfter || balanceData,
          transactionType: tx.transactionType === 'Credit' ? 'DEPOSIT' : tx.transactionType || 'DEPOSIT',
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('✅ Combined transactions:', combinedTransactions);
        setTransactions(combinedTransactions);
        // Always use balance returned from walletService.getWalletBalance (API field: data.balance)
        console.log('💰 Using balance from API:', balanceData);
        setBalance(balanceData);
      } catch (error) {
        console.error('❌ Error fetching wallet data:', error.message, error.response?.data);
        let errorMessage = 'Không thể tải dữ liệu ví. Vui lòng thử lại sau.';
        if (error.response?.status === 404) {
          errorMessage = 'Ví của bạn chưa được tạo. Vui lòng nạp tiền để kích hoạt ví.';
        } else if (error.message.includes('Invalid userId') || error.message.includes('branchId')) {
          errorMessage = 'Thiếu thông tin người dùng hoặc chi nhánh.';
        }
        message.error(errorMessage);
        setTransactions([]);
        setBalance(0);
      } finally {
        console.log('🔄 Setting loading to false');
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [visible, user]);

  const depositHistoryData = transactions
    .filter(tx => tx.transactionType === 'DEPOSIT')
    .map(tx => ({
      key: tx.id || `deposit-${tx.createdAt}`,
      time: format.dateTime(tx.createdAt, 'DD/MM/YYYY HH:mm'),
      amount: formatAmount(tx.amount),
      note: tx.description || '-',
    }));

  console.log('📊 depositHistoryData:', depositHistoryData);
  console.log('🔍 Current loading state:', loading);

  const currentBalance = formatAmount(balance);
  console.log('💰 Current balance formatted:', currentBalance);

  const depositColumns = [
    { title: 'Thời gian', dataIndex: 'time', align: 'left', key: 'time' },
    { title: 'Số tiền', dataIndex: 'amount', align: 'left', key: 'amount' },
    { title: 'Ghi chú', dataIndex: 'note', align: 'left', key: 'note' },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
      styles={{
        content: { padding: 0, borderRadius: 8 },
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#b4c80f',
            color: '#000',
            padding: '16px 20px',
            fontSize: '20px',
            fontWeight: 600,
          }}
        >
          Ví của bạn
        </div>
        <div style={{ padding: '16px', background: '#fff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
          ) : (
            <>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#333', marginBottom: '16px' }}>
                Số dư: {currentBalance}
              </p>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
                  Lịch Sử Nạp Tiền
                </h3>
              </div>
              <Table
                columns={depositColumns}
                dataSource={depositHistoryData}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Không có dữ liệu' }}
              />
              <p style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '8px' }}>
                *Chi tiết sẽ được làm mới sau 10 ngày giao dịch gần nhất
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Wallet;