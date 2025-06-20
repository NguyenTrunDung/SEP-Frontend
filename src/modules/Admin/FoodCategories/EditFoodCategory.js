import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Upload } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
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

const EditFoodCategory = ({ open, onCancel, onSubmit, formData }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (formData && open) {
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        imageUrl: formData.imageUrl || '',
      });
      setImageUrl(formData.imageUrl || '');
    } else if (!open) {
      resetForm();
      setImageUrl('');
    }
  }, [formData, open, form, resetForm]);

  const handleFormSubmit = async (values) => {
    const result = await handleSubmit(async (formData) => {
      formData.imageUrl = imageUrl;
      if (onSubmit) {
        await onSubmit(formData);
      }
    });

    if (result.success) {
      message.success('Cập nhật danh mục thành công!');
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

  const handleRemoveImage = () => {
    setImageUrl('');
    form.setFieldsValue({ imageUrl: '' });
    message.info('Hình ảnh đã được xóa!');
  };

  const customUploadRequest = ({ onSuccess }) => {
    openCloudinaryWidget((url) => {
      handleImageUpload(url);
      onSuccess({ url }, null);
    });
  };

  return (
    <ReusableModal
      title="Sửa Danh Mục"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
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
          name="imageUrl"
          label="Hình ảnh"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (e && e.fileList) {
              return e.fileList.length > 0 ? [{ url: imageUrl }] : [];
            }
            return [];
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              customRequest={customUploadRequest}
              showUploadList={false}
              beforeUpload={() => false}
              multiple={false}
              style={{ width: '100%' }}
            >
              <Button
                icon={<UploadOutlined />}
                style={{ width: '100%', borderRadius: '8px', background: '#f0f2f5', borderColor: '#d9d9d9' }}
              >
                Kéo và thả hoặc nhấp để tải hình ảnh
              </Button>
            </Upload>
            {imageUrl && (
              <div
                style={{
                  position: 'relative',
                  maxWidth: '200px',
                  marginTop: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={imageUrl}
                  alt="Category Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '2px',
                    width: '24px',
                    height: '24px',
                  }}
                />
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item className="form-actions">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large">
              Cập Nhật
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
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
};

export default EditFoodCategory;