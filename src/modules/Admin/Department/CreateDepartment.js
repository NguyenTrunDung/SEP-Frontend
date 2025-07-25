import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { departmentService } from '../../../services/departmentService';
import PropTypes from 'prop-types';
import './CreateDepartment.css';

const CreateDepartment = ({ open, onCancel, onSubmit, branchId, initialValues = {} }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [focus, setFocus] = useState('');
  const prevOpenRef = useRef(open); // Track previous open state

  useEffect(() => {
    // Only run when `open` changes
    if (open !== prevOpenRef.current) {
      if (open) {
        form.setFieldsValue(initialValues); // Set initial values when modal opens
      } else {
        resetForm(); // Reset form when modal closes
      }
      prevOpenRef.current = open; // Update previous open state
    }
  }, [open, form, resetForm, initialValues]);

  const handleFormSubmit = async (values) => {
    try {
      const normalizedName = values.name.trim().toLowerCase();
      if (!normalizedName) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban không được để trống!'],
          },
        ]);
        return;
      }

      console.log('🔍 Validating department name for create:', { name: normalizedName, branchId });
      const isUnique = await departmentService.validateDepartmentName(branchId, normalizedName);
      if (!isUnique) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban đã tồn tại trong chi nhánh này!'],
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
      console.error('❌ Failed to validate department name:', error.response?.data?.message || error.message);
      form.setFields([
        {
          name: 'name',
          errors: [error.response?.data?.message || 'Lỗi khi kiểm tra tên phòng ban!'],
        },
      ]);
      message.error(error.response?.data?.message || 'Lỗi khi tạo phòng ban!');
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
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      closable={false}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#00A99D',
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
        initialValues={initialValues}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên phòng ban!' },
            { whitespace: true, message: 'Tên phòng ban không được chỉ chứa khoảng trắng!' },
          ]}
          style={{ marginBottom: 0 }}
        >
          <div className="department-floating-input-wrapper">
            <Input
              className="department-custom-input"
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus('')}
            />
            <label
              className={`department-floating-label ${focus === 'name' || form.getFieldValue('name') ? 'focused' : ''}`}
            >
              Tên phòng ban
            </label>
          </div>
        </Form.Item>
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