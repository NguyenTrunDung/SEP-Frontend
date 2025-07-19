import React, { useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
// import { diseaseCategoryService } from '../../../services/diseaseCategoryService'; // Nếu có validate

const EditDiseaseCategory = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const { form, handleSubmit, resetForm } = useAntForm();

  useEffect(() => {
    if (formData && open) {
      if (String(formData.branchId) !== String(branchId)) {
        console.warn(`⚠️ Không thể chỉnh sửa danh mục bệnh từ chi nhánh khác!`);
        form.setFields([
          {
            name: 'name',
            errors: ['Danh mục bệnh thuộc chi nhánh khác, không thể chỉnh sửa!'],
          },
        ]);
        return;
      }
      form.setFieldsValue({ name: formData.name });
    } else if (!open) {
      resetForm();
    }
  }, [formData, open, form, resetForm, branchId]);

  const handleFormSubmit = async (values) => {
    try {
      const normalizedName = values.name.trim().toLowerCase();
      if (!normalizedName) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên danh mục bệnh không được để trống!'],
          },
        ]);
        return;
      }

      // Nếu có validate API
      // const isUnique = await diseaseCategoryService.validateName(branchId, normalizedName, formData?.id);
      // if (!isUnique) {
      //   form.setFields([
      //     {
      //       name: 'name',
      //       errors: ['Tên danh mục bệnh đã tồn tại trong chi nhánh này!'],
      //     },
      //   ]);
      //   return;
      // }

      await handleSubmit(async () => {
        if (onSubmit) {
          await onSubmit({ id: formData?.id, name: values.name, branchId });
        }
      });
    } catch (error) {
      console.error('❌ Failed to validate disease category name:', error.response?.data?.message || error.message);
      form.setFields([
        {
          name: 'name',
          errors: [error.response?.data?.message || 'Lỗi khi kiểm tra tên danh mục bệnh!'],
        },
      ]);
    }
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
              fontSize: 14
            }}
          >
            Lưu
          </Button>
          <Button
            onClick={onCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14
            }}
          >
            X
          </Button>
        </Space>
      </div>

      <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
        <div className="custom-floating">
          <label className="floating-label">Tên bệnh</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục bệnh!' },
              { whitespace: true, message: 'Tên không được chỉ chứa khoảng trắng!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input className="input-label" placeholder="Tên bệnh" />
          </Form.Item>
        </div>

      </ReusableForm>
    </ReusableModal>
  );
};

export default EditDiseaseCategory;
