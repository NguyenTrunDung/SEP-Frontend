import React from 'react';
import { Modal, Tabs, Table, Typography } from 'antd';

const { Title } = Typography;

const depositHistory = [
    { id: 1, amount: 300000, note: '', depositor: 'Admin System', date: '2024-06-01' },
];
const purchaseHistory = [
    { id: 1, amount: 25400, note: 'Mua cơm', date: '2024-06-02' },
];

const WalletModal = ({ visible, onClose, user }) => {
    const tabItems = [
        {
            key: 'deposit',
            label: 'Lịch Sử Nạp Tiền',
            children: (
                <Table
                    rowKey="id"
                    columns={[
                        { title: 'SỐ TIỀN', dataIndex: 'amount', key: 'amount', render: v => v.toLocaleString('vi-VN') },
                        { title: 'GHI CHÚ', dataIndex: 'note', key: 'note' },
                        { title: 'NGƯỜI NẠP', dataIndex: 'depositor', key: 'depositor' },
                        { title: 'NGÀY', dataIndex: 'date', key: 'date' },
                    ]}
                    dataSource={depositHistory}
                    pagination={false}
                />
            ),
        },
        {
            key: 'purchase',
            label: 'Lịch Sử Mua Hàng',
            children: (
                <Table
                    rowKey="id"
                    columns={[
                        { title: 'SỐ TIỀN', dataIndex: 'amount', key: 'amount', render: v => v.toLocaleString('vi-VN') },
                        { title: 'GHI CHÚ', dataIndex: 'note', key: 'note' },
                        { title: 'NGÀY', dataIndex: 'date', key: 'date' },
                    ]}
                    dataSource={purchaseHistory}
                    pagination={false}
                />
            ),
        },
    ];

    return (
        <Modal open={visible} onCancel={onClose} footer={null} title={<Title level={4}>Số dư</Title>}>
            <div style={{ marginBottom: 16 }}>
                <b>Số dư:</b> {user?.balance?.toLocaleString('vi-VN') || 0}
            </div>
            <Tabs items={tabItems} />
        </Modal>
    );
};

export default WalletModal; 