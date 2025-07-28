import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { departmentService } from '../../../services/departmentService';
import { environment } from '../../../services/api/config';
import PropTypes from 'prop-types';
import './Department.css';

const EditDepartment = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const { form, loading: formLoading, resetForm } = useAntForm(formData || {});
  const [focus, setFocus] = useState('');
  const prevFormDataRef = useRef(null);

  useEffect(() => {
    if (environment.features.enableLogging) {
      console.log('🔍 EditDepartment useEffect:', { open, formData });
    }

    if (formData && open) {
      if (
        prevFormDataRef.current &&
        prevFormDataRef.current.id === formData.id &&
        prevFormDataRef.current.name === formData.name &&
        prevFormDataRef.current.branchId === formData.branchId
      ) {
        if (environment.features.enableLogging) {
          console.log('🔄 Form data unchanged, skipping update');
        }
        return;
      }

      if (String(formData.branchId) !== String(branchId)) {
        console.warn(`⚠️ Department ${formData.id} from branch ${formData.branchId} cannot be edited in branch ${branchId}`);
        form.setFields([
          {
            name: 'name',
            errors: ['Phòng ban thuộc chi nhánh khác, không thể chỉnh sửa!'],
          },
        ]);
        return;
      }

      if (environment.features.enableLogging) {
        console.log('🔄 Setting form data:', formData);
      }
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
      });
      prevFormDataRef.current = formData;
    } else if (!open) {
      resetForm();
      prevFormDataRef.current = null;
    }
  }, [formData, open, form, resetForm, branchId]);

  const handleFormSubmit = async (values) => {
    try {
      const updateDto = {
        name: values.name?.trim(),
        branchId: Number(branchId),
      };

      if (environment.features.enableLogging) {
        console.log('🔍 Submitting department update:', { id: values.id, ...updateDto });
      }

      const updatedDepartment = await departmentService.updateDepartment(values.id, updateDto);

      if (!updatedDepartment) {
        form.setFields([
          {
            name: 'name',
            errors: ['Phòng ban không tồn tại!'],
          },
        ]);
        message.error('Phòng ban không tồn tại!');
        return;
      }

      if (onSubmit) {
        await onSubmit(updatedDepartment);
      }
      message.success('Cập nhật phòng ban thành công!');
      handleCancel(); // Fixed typo from handleRule to handleCancel
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật phòng ban!';
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update department:', errorMessage);
      }
      form.setFields([
        {
          name: 'name',
          errors: [errorMessage],
        },
      ]);
      message.error(errorMessage);
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
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <div className="custom-floating">
          <label className="floating-label">Tên phòng ban</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng ban!' },
              { whitespace: true, message: 'Tên phòng ban không được chỉ chứa khoảng trắng!' },
              { max: 100, message: 'Tên phòng ban không được vượt quá 100 ký tự!' },
              {
                pattern: /^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/,
                message: 'Tên phòng ban chỉ được chứa chữ cái, số, khoảng trắng và ký tự tiếng Việt!',
              },
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

EditDepartment.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EditDepartment;