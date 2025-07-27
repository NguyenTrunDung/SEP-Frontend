import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { departmentService } from '../../../services/departmentService';
import PropTypes from 'prop-types';
import './Department.css'; 

const EditDepartment = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});

  useEffect(() => {
    if (formData && open) {
      if (String(formData.branchId) !== String(branchId)) {
        console.warn(`⚠️ Attempted to edit department ${formData.id} from branch ${formData.branchId} in branch ${branchId}`);
        form.setFields([
          {
            name: 'name',
            errors: ['Phòng ban thuộc chi nhánh khác, không thể chỉnh sửa!'],
          },
        ]);
        return;
      }
      console.log('🔄 EditDepartment - Setting form data:', formData);
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
      });
    } else if (!open) {
      resetForm();
    }
  }, [formData, open, form, resetForm, branchId]);

  const handleFormSubmit = async (values) => {
    console.log('🚀 EditDepartment - Form submit with values:', values);

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

      console.log('🔍 Validating department name for edit:', { name: normalizedName, branchId, deptId: formData?.id });
      const isUnique = await departmentService.validateDepartmentName(branchId, normalizedName, formData?.id);
      if (!isUnique) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban đã tồn tại trong chi nhánh này!'],
          },
        ]);
        return;
      }

      const result = await handleSubmit(async (formData) => {
        if (onSubmit) {
          await onSubmit({ id: formData.id, name: formData.name, branchId });
        }
      });

      if (result.success) {
        handleCancel();
      }
    } catch (error) {
      console.error('❌ Failed to validate department name:', error.response?.data?.message || error.message);
      form.setFields([
        {
          name: 'name',
          errors: [error.response?.data?.message || 'Lỗi khi kiểm tra tên phòng ban!'],
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
      title={<span style={{ fontSize: '30px' }}>Chỉnh sửa</span>}
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

      <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical" className={formLoading ? 'form-loading' : ''}>
        <Form.Item name="id" hidden>
          <Input />
 “

        </Form.Item>

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
            <Input className="input-label" placeholder="Tên phòng ban" />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

EditDepartment.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EditDepartment;