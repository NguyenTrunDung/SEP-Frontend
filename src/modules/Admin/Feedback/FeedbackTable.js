import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin } from 'antd';
import { EyeOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';

// Hàm ánh xạ số sao thành mô tả
const getRatingLabel = (rating) => {
    switch (rating) {
        case 1: return 'Rất tệ';
        case 2: return 'Tệ';
        case 3: return 'Bình thường';
        case 4: return 'Tốt';
        case 5: return 'Rất tốt';
        default: return 'Không xác định';
    }
};

const FeedbacksTable = ({
    dataSource = [],
    loading,
    onDelete,
    onReply,
    className,
    ...rest
}) => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => setDebouncedSearchText(searchText), 1000);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchText]);

    const filteredData = useMemo(() => {
        let filtered = dataSource;
        if (debouncedSearchText) {
            filtered = filtered.filter(item =>
                item.items?.some(item => item.name.toLowerCase().includes(debouncedSearchText.toLowerCase())) ||
                item.customerName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                item.content?.toLowerCase().includes(debouncedSearchText.toLowerCase())
            );
        }
        return filtered;
    }, [dataSource, debouncedSearchText]);

    const handleViewDetails = async (record) => {
        setModalLoading(true);
        setIsModalVisible(true);
        setSelectedFeedback(record);
        setModalLoading(false);
    };

    const handleDelete = (record) => {
        if (onDelete) onDelete(record);
    };

    const handleReply = (record) => {
        if (onReply) onReply(record);
    };

    const columns = [
        {
            title: 'ĐƠN HÀNG',
            dataIndex: 'items',
            key: 'items',
            align: 'left',
            sorter: (a, b) => {
                const aItems = a.items ? a.items.map(item => item.name).join(', ') : '';
                const bItems = b.items ? b.items.map(item => item.name).join(', ') : '';
                return aItems.localeCompare(bItems);
            },
            render: (items) => items ? items.map(item => item.name).join(', ') : '-',
        },
        {
            title: 'KHÁCH HÀNG',
            dataIndex: 'customerName',
            key: 'customerName',
            align: 'left',
            sorter: (a, b) => a.customerName.localeCompare(b.customerName),
        },
        {
            title: 'ĐÁNH GIÁ',
            dataIndex: 'rating',
            key: 'rating',
            align: 'left',
            sorter: (a, b) => a.rating - b.rating,
            render: (rating) => `${rating} ⭐ (${getRatingLabel(rating)})`,
        },
        {
            title: 'NỘI DUNG',
            dataIndex: 'content',
            key: 'content',
            align: 'left',
        },
        {
            title: '',
            key: 'actions',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <div>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
                    </Tooltip>
                    <Tooltip title="Phản hồi">
                        <Button type="text" icon={<MessageOutlined />} onClick={() => handleReply(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa đánh giá?"
                            description={`Bạn có chắc chắn muốn xóa đánh giá từ ${record.customerName}?`}
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className={`reusable-table-v2 ${className || ''}`}>
            <ReusableTableV2
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                disableSearch
                disableCreate
                disableRefresh
                rowKey="id"
                pagination={{
                    show: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: true,
                    showSizeChanger: true,
                }}
                className="reusable-table-v2"
            />
            <Modal
                title="Chi tiết đánh giá"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>,
                ]}
                width={600}
            >
                {modalLoading ? (
                    <Spin size="large" />
                ) : (
                    selectedFeedback && (
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Đơn hàng">
                                {selectedFeedback.items ? selectedFeedback.items.map(item => item.name).join(', ') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{selectedFeedback.customerName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Đánh giá">
                                {selectedFeedback.rating
                                    ? `${selectedFeedback.rating} ⭐ (${getRatingLabel(selectedFeedback.rating)})`
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nội dung">{selectedFeedback.content || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Phản hồi">{selectedFeedback.reply || 'Chưa có phản hồi'}</Descriptions.Item>
                        </Descriptions>
                    )
                )}
            </Modal>
        </div>
    );
};

FeedbacksTable.propTypes = {
    dataSource: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        items: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
        })),
        customerName: PropTypes.string,
        rating: PropTypes.number,
        content: PropTypes.string,
        reply: PropTypes.string,
    })),
    loading: PropTypes.bool,
    onDelete: PropTypes.func,
    onReply: PropTypes.func,
    className: PropTypes.string,
};

export default FeedbacksTable;