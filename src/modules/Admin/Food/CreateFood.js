import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Select, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { validateImageFile, createImagePreview, cleanupImagePreview, getImageUrlWithFallback } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';

const { Dragger } = Upload;
const { Text } = Typography;

const CreateFood = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { categories } = useFoodCategories();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setImageFile(null);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    } else if (!open) {
      resetForm();
      setImageFile(null);
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl('');
      }
    }
  }, [open, initialValues, form, resetForm]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 Component unmounting - cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFormSubmit = async (values) => {
    console.log('🚀 CreateFood - Form submit with values:', values);
    console.log('🚀 CreateFood - Image state:', {
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name,
      previewUrl: !!previewUrl,
    });

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

    console.log('📁 New image file selected:', file.name);

    if (previewUrl) {
      console.log('🧹 Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    setImageFile(file);
    const preview = createImagePreview(file);
    console.log('🖼️ Created new preview URL:', preview);
    setPreviewUrl(preview);

    message.success('Hình ảnh đã được chọn để tải lên server!');
    return false;
  };

  const handleRemoveImage = () => {
    console.log('🗑️ Removing image');

    if (previewUrl) {
      console.log('🧹 Cleaning up preview URL on removal:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }

    setImageFile(null);
    message.info('Hình ảnh đã được xóa!');
  };

  const hasImage = !!imageFile;
  const currentImageSrc = previewUrl;

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Thêm</span>}
      open={open}
      onCancel={handleCancel}
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
        initialValues={initialValues}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          // label="Tên món ăn"
          rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
          className="floating-form-item"
        >
          <Input className="floating-input" placeholder="Nhập tên món ăn" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          // label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          className="floating-form-item"
        >
          <Select
            className="floating-input"
            placeholder="Chọn danh mục"
            options={categories.map(category => ({
              value: category.id,
              label: category.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="description"
          // label="Mô tả"
          className="floating-form-item"
        >
          <Input.TextArea className="floating-input" placeholder="Nhập mô tả món ăn" rows={4} />
        </Form.Item>

        <Form.Item
          name="priceForGuest"
          label="Giá cho khách"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho khách!' }]}
          className="floating-form-item"
        >
          <InputNumber
            className="floating-input"
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="priceForPatient"
          label="Giá cho bệnh nhân"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho bệnh nhân!' }]}
          className="floating-form-item"
        >
          <InputNumber
            className="floating-input"
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="priceForStaff"
          label="Giá cho nhân viên"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho nhân viên!' }]}
          className="floating-form-item"
        >
          <InputNumber
            className="floating-input"
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item label="Hình ảnh món ăn" className="floating-form-item">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Dragger
              name="image"
              multiple={false}
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept=".png,.jpg,.jpeg"
              style={{
                background: hasImage ? '#f6ffed' : '#fafafa',
                border: hasImage ? '2px dashed #52c41a' : '1px dashed #d9d9d9',
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
                    border: '1px solid #d9d9d9',
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

CreateFood.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

export default CreateFood;