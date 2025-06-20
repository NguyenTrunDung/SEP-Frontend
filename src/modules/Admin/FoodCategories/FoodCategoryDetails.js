import React from 'react';
import { Modal, Descriptions, Image, Button } from 'antd';
import PropTypes from 'prop-types';

const FoodCategoryDetails = ({ open, onCancel, category }) => {
  return (
    <Modal
      title="Chi Tiết Danh Mục"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={600}
    >
      {category ? (
        <Descriptions bordered column={1} labelStyle={{ width: 150 }}>
          <Descriptions.Item label="ID">{category.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tên danh mục">
            {category.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự">
            {category.sort || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Hình ảnh">
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt="category"
                style={{ width: 100, height: 100, objectFit: 'cover' }}
                preview
              />
            ) : (
              <span>Không có</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Chi nhánh">
            {category.branchId || '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu danh mục.</p>
      )}
    </Modal>
  );
};

FoodCategoryDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    imageUrl: PropTypes.string,
    sort: PropTypes.number,
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default FoodCategoryDetails;