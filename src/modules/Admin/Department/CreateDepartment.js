import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';
import './Department.css';

const CreateDepartment = ({ open, onCancel, onSubmit, branchId, initialValues = {} }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [focus, setFocus] = useState('');

  useEffect(() => {
    console.log('useEffect triggered', { open, initialValues });
    if (open) {
      form.setFieldsValue(initialValues);
    } else {
      resetForm();
    }
  }, [open, initialValues]); 

  const handleFormSubmit = async (values) => {
    try {
      const normalizedName = values.name.trim();
      if (!normalizedName) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban không được để trống!'],
          },
        ]);
        return;
      }

      await handleSubmit(async (formData) => {
        if (onSubmit) {
          await onSubmit({ name: formData.name, branchId });
        }
      });
      handleCancel();
    } catch (error) {
      console.error('❌ Failed to create department:', error.response?.data?.message || error.message);
      form.setFields([
        {
          name: 'name',
          errors: [error.response?.data?.message || 'Lỗi khi tạo phòng ban!'],
        },
      ]);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px', color: '#000' }}>Thêm</span>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      closable={false}
      width={700}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#52c41a',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
            loading={formLoading}
          >
            Lưu
          </Button>
          <Button
            onClick={handleCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            X
          </Button>
        </Space>
      </div>

      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <div className="custom-floating">
          <label className="floating-label">Tên phòng ban</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng ban!' },
              { whitespace: true, message: 'Tên phòng ban không được chỉ chứa khoảng trắng!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              className="input-label"
              placeholder="Tên phòng ban"
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

CreateDepartment.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialValues: PropTypes.object,
};

export default CreateDepartment;