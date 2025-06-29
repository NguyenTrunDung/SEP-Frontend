import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { validateImageFile, createImagePreview, cleanupImagePreview, getImageUrlWithFallback } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';

const { Text } = Typography;
const { Dragger } = Upload;

const EditFoodCategory = ({ open, onCancel, onSubmit, formData }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    if (formData && open) {
      console.log('🔄 EditFoodCategory - Setting form data:', formData);
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        imageUrl: formData.imageUrl || '',
        sort: formData.sort, // Include sort field for edit operations
      });
      setExistingImageUrl(formData.imageUrl || '');
      // Reset file-related state when editing
      setImageFile(null);
      setImageRemoved(false);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    } else if (!open) {
      resetForm();
      setExistingImageUrl('');
      setImageFile(null);
      setImageRemoved(false);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    }
  }, [formData, open, form, resetForm]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining preview URLs when component unmounts
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 EditFoodCategory - Component unmounting - cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]); // This effect only cares about previewUrl changes

  const handleFormSubmit = async (values) => {
    console.log('🚀 EditFoodCategory - Form submit with values:', values);
    console.log('🚀 EditFoodCategory - Image state:', {
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name,
      existingImageUrl,
      imageRemoved,
      previewUrl: !!previewUrl
    });

    const result = await handleSubmit(async (formData) => {
      if (onSubmit) {
        // If image was explicitly removed, clear it
        if (imageRemoved) {
          console.log('🗑️ Image was removed, clearing image data');
          formData.imageUrl = '';
        }

        // Call parent with form data and image file
        await onSubmit(formData, imageFile);
      }
    });

    if (result.success) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    setExistingImageUrl('');
    setImageFile(null);
    setImageRemoved(false);
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

    console.log('📁 EditFoodCategory - New image file selected:', file.name);

    // Clean up existing preview BEFORE creating new one
    if (previewUrl) {
      console.log('🧹 EditFoodCategory - Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    // Set the new file and reset removal flag
    setImageFile(file);
    setImageRemoved(false); // Reset removed flag when new file is selected

    // Create new preview URL
    const preview = createImagePreview(file);
    console.log('🖼️ EditFoodCategory - Created new preview URL:', preview);
    setPreviewUrl(preview);

    message.success('Hình ảnh đã được chọn để tải lên server!');
    return false; // Prevent auto upload
  };

  const handleRemoveImage = () => {
    console.log('🗑️ EditFoodCategory - Removing image');

    // Clean up preview URL if it exists
    if (previewUrl) {
      console.log('🧹 EditFoodCategory - Cleaning up preview URL on removal:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }

    // Reset state
    setImageFile(null);
    setImageRemoved(true); // Mark as explicitly removed

    // Don't clear existingImageUrl immediately - let it show as removed state
    message.info('Hình ảnh đã được xóa!');
  };

  // Determine current image source for display
  const getCurrentImageSrc = () => {
    // If image was explicitly removed, show nothing
    if (imageRemoved) {
      return null;
    }

    // Priority: New file preview > Existing image
    if (previewUrl) {
      return previewUrl;
    }

    if (existingImageUrl) {
      return getImageUrlWithFallback(existingImageUrl, '/images/placeholder-food.png');
    }

    return null;
  };

  const hasImage = (!!imageFile || (!!existingImageUrl && !imageRemoved));
  const currentImageSrc = getCurrentImageSrc();

  return (
    <ReusableModal
      title="Sửa Danh Mục"
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
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="sort" hidden>
          <Input />
        </Form.Item>

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
                background: hasImage ? '#f6ffed' : '#fafafa',
                border: hasImage ? '2px dashed #52c41a' : '1px dashed #d9d9d9'
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: hasImage ? '#52c41a' : '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                {hasImage ? 'Nhấp để thay đổi hình ảnh' : 'Nhấp hoặc kéo file vào khu vực này để tải lên'}
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ định dạng: PNG, JPG, JPEG. Kích thước tối đa: 5MB
              </p>
            </Dragger>

            {/* Image Preview */}
            {currentImageSrc && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <img
                  src={currentImageSrc}
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
                      {imageFile ? (
                        `${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB) - Mới`
                      ) : (
                        'Hình ảnh hiện tại'
                      )}
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

            {/* Show removed state */}
            {imageRemoved && !imageFile && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <Text type="secondary">Hình ảnh đã được xóa</Text>
              </div>
            )}

            {/* Upload Button (Alternative) */}
            {!hasImage && (
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
              Cập nhật danh mục
            </Button>
          </Space>
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

EditFoodCategory.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object,
};

export default EditFoodCategory;