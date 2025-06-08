// src/components/Wallet/Wallet.js
import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Table, Spin } from 'antd';
import { walletService } from '../../services/walletService';

const { TabPane } = Tabs;
const formatDateTime = (date) => {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '/').replace(',', '');
};

const formatAmount = (amount) => {
  return `${amount.toLocaleString('vi-VN')}đ`;
};

const Wallet = ({ visible, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState('paymentHistory');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (visible && userId) {
        setLoading(true);
        try {
          const data = await walletService.getWalletTransactions(userId);
          setTransactions(data);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTransactions();
  }, [visible, userId]);

  const paymentHistoryData = transactions
    .filter(tx => tx.transactionType === 'PAYMENT')
    .map(tx => ({
      key: tx.id,
      orderId: tx.orderId,
      time: formatDateTime(new Date(tx.createdAt)),
      amount: formatAmount(tx.amount),
    }));

  const depositHistoryData = transactions
    .filter(tx => tx.transactionType === 'DEPOSIT')
    .map(tx => ({
      key: tx.id,
      time: formatDateTime(new Date(tx.createdAt)),
      amount: formatAmount(tx.amount),
      note: tx.description,
    }));

  const currentBalance = transactions.length > 0 ? formatAmount(transactions[transactions.length - 1].balanceAfter) : '0đ';

  const paymentColumns = [
    { title: 'Đơn hàng', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount' },
  ];

  const depositColumns = [
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
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
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Lịch Sử Thanh Toán" key="paymentHistory">
                  <Table
                    columns={paymentColumns}
                    dataSource={paymentHistoryData}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Không có dữ liệu' }}
                  />
                </TabPane>
                <TabPane tab="Lịch Sử Nạp Tiền" key="depositHistory">
                  <Table
                    columns={depositColumns}
                    dataSource={depositHistoryData}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Không có dữ liệu' }}
                  />
                </TabPane>
              </Tabs>
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