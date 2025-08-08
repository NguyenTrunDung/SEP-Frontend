import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { validateImageFile, createImagePreview, cleanupImagePreview, getImageUrlWithFallback } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';
import '../Branch/Branch.css'; // Reuse Branch.css for consistent styling

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
        sort: formData.sort,
      });
      setExistingImageUrl(formData.imageUrl || '');
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

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 EditFoodCategory - Component unmounting - cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFormSubmit = async (values) => {
    console.log('🚀 EditFoodCategory - Form submit with values:', values);
    console.log('🚀 EditFoodCategory - Image state:', {
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name,
      existingImageUrl,
      imageRemoved,
      previewUrl: !!previewUrl,
    });

    const normalizedName = values.name.trim().toLowerCase();
    if (!normalizedName) {
      form.setFields([
        {
          name: 'name',
          errors: ['Tên danh mục không được để trống!'],
        },
      ]);
      return;
    }

    const result = await handleSubmit(async (formData) => {
      if (onSubmit) {
        if (imageRemoved) {
          console.log('🗑️ Image was removed, clearing image data');
          formData.imageUrl = '';
        }
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

    if (previewUrl) {
      console.log('🧹 EditFoodCategory - Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    setImageFile(file);
    setImageRemoved(false);

    const preview = createImagePreview(file);
    console.log('🖼️ EditFoodCategory - Created new preview URL:', preview);
    setPreviewUrl(preview);

    message.success('Hình ảnh đã được chọn để tải lên server!');
    return false;
  };

  const handleRemoveImage = () => {
    console.log('🗑️ EditFoodCategory - Removing image');

    if (previewUrl) {
      console.log('🧹 EditFoodCategory - Cleaning up preview URL on removal:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }

    setImageFile(null);
    setImageRemoved(true);
    message.info('Hình ảnh đã được xóa!');
  };

  const getCurrentImageSrc = () => {
    if (imageRemoved) {
      return null;
    }

    if (previewUrl) {
      return previewUrl;
    }

    if (existingImageUrl) {
      return getImageUrlWithFallback(existingImageUrl, '/images/placeholder-food.png');
    }

    return null;
  };

  const hasImage = !!imageFile || (!!existingImageUrl && !imageRemoved);
  const currentImageSrc = getCurrentImageSrc();

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Sửa Danh Mục</span>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      closable={false}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={formLoading}
            disabled={formLoading}
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

        <div className="custom-floating">
          <label className="floating-label">Tên danh mục</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { whitespace: true, message: 'Tên danh mục không được chỉ chứa khoảng trắng!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input className="input-label" placeholder="Nhập tên danh mục" />
          </Form.Item>
        </div>

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