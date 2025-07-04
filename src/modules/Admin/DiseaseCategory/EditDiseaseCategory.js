import React from 'react';
import { Button, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';

const EditDiseaseCategory = ({ open, onCancel }) => {
  const handleSubmit = () => {
    message.error('Chỉnh sửa danh mục bệnh không được hỗ trợ bởi backend!');
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Chỉnh sửa</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      closable={false}
    >
      <div>Chức năng chỉnh sửa danh mục bệnh hiện không được hỗ trợ.</div>
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button
          onClick={onCancel}
          style={{
            backgroundColor: '#ff4d4f',
            color: '#fff',
            border: 'none',
            minWidth: 64,
            height: 32,
            fontSize: 14,
          }}
        >
          Đóng
        </Button>
      </div>
    </ReusableModal>
  );
};

export default EditDiseaseCategory;