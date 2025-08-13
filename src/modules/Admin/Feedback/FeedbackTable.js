import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin, message } from 'antd';
import { EyeOutlined, DeleteOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { environment } from '../../../services/api/config';
import { feedbackService } from '../../../services/feedbackService';

const getRatingLabel = (rating) => {
  if (environment.features?.enableLogging) {
    console.log('🔍 getRatingLabel called with rating:', rating);
  }
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
  branchId,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  if (environment.features?.enableLogging) {
    console.log('🔍 FeedbacksTable props:', { dataSource, loading, branchId });
  }

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
      if (environment.features?.enableLogging) {
        console.log('🔍 Debounced search text:', searchText);
      }
    }, 1000);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchText]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(dataSource)) {
      if (environment.features?.enableLogging) {
        console.warn('⚠️ FeedbacksTable dataSource is not an array:', dataSource);
      }
      return [];
    }
    let filtered = dataSource;
    if (debouncedSearchText) {
      filtered = filtered.filter(item => {
        const matches =
          (item.content?.toLowerCase() || '').includes(debouncedSearchText.toLowerCase()) ||
          String(item.orderId || '').includes(debouncedSearchText) ||
          (item.customerName?.toLowerCase() || '').includes(debouncedSearchText.toLowerCase());
        if (environment.features?.enableLogging) {
          console.log('🔍 Filter item:', item, 'Matches:', matches);
        }
        return matches;
      });
    }
    if (environment.features?.enableLogging) {
      console.log('🔍 Filtered feedbacks:', filtered);
    }
    return filtered;
  }, [dataSource, debouncedSearchText]);

  const handleViewDetails = async (record) => {
    if (environment.features?.enableLogging) {
      console.log('🔍 Viewing feedback details for ID:', record.id);
    }
    setModalLoading(true);
    try {
      const freshFeedback = await feedbackService.getFeedback(record.id);
      if (freshFeedback) {
        setSelectedFeedback(freshFeedback);
        if (environment.features?.enableLogging) {
          console.log('✅ Fetched fresh feedback:', freshFeedback);
        }
      } else {
        setSelectedFeedback(record);
        message.warning('Không thể tải dữ liệu mới nhất, hiển thị dữ liệu hiện tại');
      }
      setIsModalVisible(true);
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to fetch feedback for details:', error.message);
      }
      setSelectedFeedback(record);
      message.error('Lỗi khi tải chi tiết đánh giá, hiển thị dữ liệu hiện tại');
      setIsModalVisible(true);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (record) => {
    if (onDelete) {
      if (environment.features?.enableLogging) {
        console.log('🔍 Deleting feedback:', record.id);
      }
      onDelete(record);
    }
  };

  const handleReply = (record) => {
    if (onReply) {
      if (environment.features?.enableLogging) {
        console.log('🔍 Replying to feedback:', record.id);
      }
      onReply(record);
    }
  };

  const columns = [
    {
      title: 'ĐƠN HÀNG',
      dataIndex: 'orderId',
      key: 'orderId',
      align: 'left',
      sorter: (a, b) => (a.orderId || 0) - (b.orderId || 0),
      render: (orderId) => orderId || '-',
    },
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'customerName',
      key: 'customerName',
      align: 'left',
      sorter: (a, b) => (a.customerName || '').localeCompare(b.customerName || ''),
      render: (customerName) => customerName || 'Không xác định',
    },
    {
      title: 'ĐÁNH GIÁ',
      dataIndex: 'rating',
      key: 'rating',
      align: 'left',
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (rating) => {
        const rendered = rating ? `${rating} ⭐ (${getRatingLabel(rating)})` : '-';
        if (environment.features?.enableLogging) {
          console.log('🔍 Rendering rating:', { rating, rendered });
        }
        return rendered;
      },
    },
    {
      title: 'NỘI DUNG',
      dataIndex: 'content',
      key: 'content',
      align: 'left',
      render: (content) => content || '-',
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
              description={`Bạn có chắc chắn muốn xóa đánh giá từ ${record.customerName || 'khách hàng'}?`}
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
      <Input
        placeholder="Tìm kiếm theo nội dung, đơn hàng hoặc tên khách hàng"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
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
              <Descriptions.Item label="Đơn hàng">{selectedFeedback.orderId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedFeedback.customerName || 'Không xác định'}</Descriptions.Item>
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
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      orderId: PropTypes.number,
      userId: PropTypes.string,
      customerName: PropTypes.string,
      rating: PropTypes.number,
      content: PropTypes.string,
      reply: PropTypes.string,
      branchId: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  onDelete: PropTypes.func,
  onReply: PropTypes.func,
  className: PropTypes.string,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FeedbacksTable;