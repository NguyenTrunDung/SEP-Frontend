import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { validateImageFile, createImagePreview, cleanupImagePreview } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';
import './AddFoodCategory.css';

const { Text } = Typography;
const { Dragger } = Upload;

const AddFoodCategory = ({ open, onCancel, onSubmit }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [focus, setFocus] = useState('');

  useEffect(() => {
    if (!open) {
      resetForm();
      setImageFile(null);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    }

    return () => {
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
      }
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 AddFoodCategory - Component unmounting - cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

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

    console.log('📁 AddFoodCategory - New image file selected:', file.name);

    if (previewUrl) {
      console.log('🧹 AddFoodCategory - Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    setImageFile(file);
    const preview = createImagePreview(file);
    console.log('🖼️ AddFoodCategory - Created new preview URL:', preview);
    setPreviewUrl(preview);

    message.success('Hình ảnh đã được chọn để tải lên server!');
    return false;
  };

  const handleRemoveImage = () => {
    console.log('🗑️ AddFoodCategory - Removing image');

    if (previewUrl) {
      console.log('🧹 AddFoodCategory - Cleaning up preview URL on removal:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }

    setImageFile(null);
    message.info('Hình ảnh đã được xóa!');
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
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          style={{ marginBottom: 0 }}
        >
          <div className="category-floating-input-wrapper">
            <Input
              className="category-custom-input"
              onFocus={() => setFocus('name')}
              onBlur={(e) => {
                if (!e.target.value) setFocus('');
              }}
              value={form.getFieldValue('name')}
              onChange={(e) => form.setFieldValue('name', e.target.value)}
            />
            <label
              className={`category-floating-label ${focus === 'name' || form.getFieldValue('name') ? 'focused' : ''}`}
            >
              Tên danh mục
            </label>
          </div>
        </Form.Item>

        <Form.Item label="Hình ảnh danh mục">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Dragger
              name="image"
              multiple={false}
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept=".png,.jpg,.jpeg"
              style={{
                background: imageFile ? '#f6ffed' : '#fafafa',
                border: imageFile ? '2px dashed #52c41a' : '1px dashed #d9d9d9',
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
                    border: '1px solid #d9d9d9',
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