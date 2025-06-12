import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';

// Initialize Cloudinary upload widget
const openCloudinaryWidget = (cb) => {
  window.cloudinary.openUploadWidget(
    {
      cloudName: 'depxkho4m',
      uploadPreset: 'sep490',
      sources: ['local', 'url', 'camera'],
      multiple: false,
      resourceType: 'image',
      clientAllowedFormats: ['png', 'jpg', 'jpeg'],
      maxFileSize: 5000000,
    },
    (error, result) => {
      if (!error && result && result.event === 'success') {
        cb(result.info.secure_url);
      } else if (error) {
        message.error('Lỗi khi tải lên hình ảnh!');
      }
    }
  );
};

const CreateFoodCategory = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
  formData,
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        sort: formData.sort || 0,
        imageUrl: formData.imageUrl || '',
      });
      setImageUrl(formData.imageUrl || '');
    } else {
      form.resetFields();
      setImageUrl('');
    }
  }, [formData, form]);

  const handleFormSubmit = async (values) => {
    const result = await handleSubmit(async (formData) => {
      formData.imageUrl = imageUrl;
      if (onSubmit) {
        await onSubmit(formData);
      }
    });

    if (result.success) {
      message.success(formData && formData.id ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    setImageUrl('');
    if (onCancel) {
      onCancel();
    }
  };

  const handleImageUpload = (url) => {
    setImageUrl(url);
    form.setFieldsValue({ imageUrl: url });
    message.success('Hình ảnh đã được tải lên thành công!');
  };

  return (
    <ReusableModal
      title={formData && formData.id ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        initialValues={initialValues}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item
          name="id"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="Thứ tự"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
        >
          <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Hình ảnh"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<UploadOutlined />}
              onClick={() => openCloudinaryWidget(handleImageUpload)}
              style={{ width: '100%' }}
            >
              Tải lên hình ảnh
            </Button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Category"
                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: 8 }}
              />
            )}
            <Input value={imageUrl} readOnly style={{ display: 'none' }} />
          </Space>
        </Form.Item>

        <Form.Item className="form-actions">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large">
              {formData && formData.id ? 'Cập Nhật' : 'Lưu Danh Mục'}
            </Button>
          </Space>
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

CreateFoodCategory.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    imageUrl: PropTypes.string,
    sort: PropTypes.number,
  }),
};

export default CreateFoodCategory;