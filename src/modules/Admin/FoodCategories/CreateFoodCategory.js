import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { validateImageFile, createImagePreview, cleanupImagePreview } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';

const { Text } = Typography;
const { Dragger } = Upload;

const AddFoodCategory = ({ open, onCancel, onSubmit }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!open) {
      resetForm();
      setImageFile(null);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    }

    // Cleanup function for when component unmounts or dependencies change
    return () => {
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
      }
    };
  }, [open]); // Removed previewUrl from dependencies to prevent cleanup loops

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining preview URLs when component unmounts
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 CreateFoodCategory - Component unmounting - cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]); // This effect only cares about previewUrl changes

  const handleFormSubmit = async (values) => {
    const result = await handleSubmit(async (formData) => {
      if (onSubmit) {
        await onSubmit(formData, imageFile);
      }
    });

    if (result.success) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    setImageFile(null);
    if (previewUrl) {
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleFileUpload = (file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      message.error(validation.error);
      return false;
    }

    console.log('📁 CreateFoodCategory - New image file selected:', file.name);

    // Clean up existing preview BEFORE creating new one
    if (previewUrl) {
      console.log('🧹 CreateFoodCategory - Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    // Set the new file
    setImageFile(file);

    // Create new preview URL
    const preview = createImagePreview(file);
    console.log('🖼️ CreateFoodCategory - Created new preview URL:', preview);
    setPreviewUrl(preview);

    message.success('Hình ảnh đã được chọn để tải lên server!');
    return false; // Prevent auto upload
  };

  const handleRemoveImage = () => {
    console.log('🗑️ CreateFoodCategory - Removing image');

    // Clean up preview URL if it exists
    if (previewUrl) {
      console.log('🧹 CreateFoodCategory - Cleaning up preview URL on removal:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }

    // Reset state
    setImageFile(null);
    message.info('Hình ảnh đã được xóa!');
  };

  return (
    <ReusableModal
      title="Thêm Danh Mục Mới"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item label="Hình ảnh danh mục">
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Image Upload Area */}
            <Dragger
              name="image"
              multiple={false}
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept=".png,.jpg,.jpeg"
              style={{
                background: imageFile ? '#f6ffed' : '#fafafa',
                border: imageFile ? '2px dashed #52c41a' : '1px dashed #d9d9d9'
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: imageFile ? '#52c41a' : '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                {imageFile ? 'Hình ảnh đã được chọn' : 'Nhấp hoặc kéo file vào khu vực này để tải lên'}
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ định dạng: PNG, JPG, JPEG. Kích thước tối đa: 5MB
              </p>
            </Dragger>

            {/* Image Preview */}
            {previewUrl && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {imageFile?.name} ({(imageFile?.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
                      danger
                    >
                      Xóa
                    </Button>
                  </Space>
                </div>
              </div>
            )}

            {/* Upload Button (Alternative) */}
            {!imageFile && (
              <Upload
                name="image"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".png,.jpg,.jpeg"
              >
                <Button icon={<UploadOutlined />} block>
                  Chọn hình ảnh từ máy tính
                </Button>
              </Upload>
            )}
          </Space>
        </Form.Item>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              disabled={formLoading}
            >
              Tạo danh mục
            </Button>
          </Space>
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

AddFoodCategory.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddFoodCategory;