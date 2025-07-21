import React, { useEffect, useState } from 'react';
import { Modal, Tabs, Table, Typography, Spin, message } from 'antd';
import { fetchWalletCreditHistory, fetchUserPurchaseHistory } from '../../../services/userWalletService';

const { Title } = Typography;

const WalletModal = ({ visible, onClose, user }) => {
    const [depositHistory, setDepositHistory] = useState([]);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible || !user) return;
        setLoading(true);
        Promise.all([
            fetchWalletCreditHistory({ userId: user.userId }),
            fetchUserPurchaseHistory(user.userId)
        ])
            .then(([creditRes, purchaseRes]) => {
                console.log('API nạp tiền (raw):', creditRes);
                console.log('API mua hàng (raw):', purchaseRes);
                // Lấy mảng đúng dù trả về object hay mảng
                const depositArr = Array.isArray(creditRes)
                    ? creditRes
                    : (Array.isArray(creditRes?.data) ? creditRes.data : []);
                const purchaseArr = Array.isArray(purchaseRes)
                    ? purchaseRes
                    : (Array.isArray(purchaseRes?.data) ? purchaseRes.data : []);
                setDepositHistory(depositArr);
                setPurchaseHistory(purchaseArr);
            })
            .catch(() => message.error('Không thể tải lịch sử ví'))
            .finally(() => setLoading(false));
    }, [visible, user]);

    // Columns cho lịch sử nạp tiền
    const depositColumns = [
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => v?.toLocaleString('vi-VN') },
        { title: 'Số dư sau', dataIndex: 'balanceAfter', key: 'balanceAfter', render: (v) => v?.toLocaleString('vi-VN') },
        { title: 'Ghi chú', dataIndex: 'description', key: 'description' },
        {
            title: 'Ngày', dataIndex: 'createdAt', key: 'createdAt', render: (date) => {
                const d = new Date(date);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            }
        },
        { title: 'Người nạp', dataIndex: 'createdBy', key: 'createdBy' }
    ];

    // Columns cho lịch sử mua hàng
    const purchaseColumns = [
        { title: 'Mã đơn hàng', dataIndex: 'orderId', key: 'orderId' },
        {
            title: 'Ngày mua', dataIndex: 'createdAt', key: 'createdAt', render: (date) => {
                const d = new Date(date);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            }
        },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => v?.toLocaleString('vi-VN') },
        { title: 'Món ăn', dataIndex: 'foodNames', key: 'foodNames', render: (foods) => Array.isArray(foods) ? foods.join(', ') : '' },
        { title: 'Ghi chú', dataIndex: 'description', key: 'description' }
    ];

    const tabItems = [
        {
            key: 'deposit',
            label: 'Lịch Sử Nạp Tiền',
            children: (
                <Table
                    rowKey={(record, idx) => record.id || idx}
                    columns={depositColumns}
                    dataSource={depositHistory}
                    pagination={false}
                    loading={loading}
                />
            ),
        },
        {
            key: 'purchase',
            label: 'Lịch Sử Mua Hàng',
            children: (
                <Table
                    rowKey={(record, idx) => record.transactionId || idx}
                    columns={purchaseColumns}
                    dataSource={purchaseHistory}
                    pagination={false}
                    loading={loading}
                />
            ),
        },
    ];

    return (
    <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        title={<Title level={4}>Thông tin giao dịch</Title>}
        width={920} // <-- tăng chiều rộng modal
        bodyStyle={{ padding: 24 }} // tuỳ chọn, cho đẹp
    >
        <div style={{ marginBottom: 16, color: 'red', fontSize: '2em' }}>
            {user?.balance?.toLocaleString('vi-VN') || 0}
        </div>
        <Tabs items={[
            {
                key: 'deposit',
                label: 'Lịch Sử Nạp Tiền',
                children: (
                    <Table
                        rowKey={(record, idx) => record.id || idx}
                        columns={depositColumns}
                        dataSource={depositHistory}
                        pagination={false}
                        loading={loading}
                        scroll={{ y: 350 }} // <-- thêm scroll dọc, chiều cao cố định
                    />
                ),
            },
            {
                key: 'purchase',
                label: 'Lịch Sử Mua Hàng',
                children: (
                    <Table
                        rowKey={(record, idx) => record.transactionId || idx}
                        columns={purchaseColumns}
                        dataSource={purchaseHistory}
                        pagination={false}
                        loading={loading}
                        scroll={{ y: 350 }} // <-- thêm scroll dọc, chiều cao cố định
                    />
                ),
            },
        ]} />
    </Modal>
);
};

export default WalletModal; 