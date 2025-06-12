import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import PropTypes from 'prop-types';

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

const CreateFood = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
  formData,
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [imageUrl, setImageUrl] = useState('');
  const { categories } = useFoodCategories(1); // Hardcoded branchId

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        priceForGuest: formData.priceForGuest,
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
      message.success(formData && formData.id ? 'Cập nhật món ăn thành công!' : 'Tạo món ăn thành công!');
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
      title={formData && formData.id ? 'Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
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
          label="Tên món ăn"
          rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
        >
          <Input placeholder="Nhập tên món ăn" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select
            placeholder="Chọn danh mục"
            options={categories.map(category => ({
              value: category.id,
              label: category.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea placeholder="Nhập mô tả món ăn" rows={4} />
        </Form.Item>

        <Form.Item
          name="priceForGuest"
          label="Giá cho khách"
          rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
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
                alt="Food"
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
              {formData && formData.id ? 'Cập Nhật' : 'Lưu Món Ăn'}
            </Button>
          </Space>
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

CreateFood.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    categoryId: PropTypes.number,
    description: PropTypes.string,
    priceForGuest: PropTypes.number,
    imageUrl: PropTypes.string,
  }),
};

export default CreateFood;