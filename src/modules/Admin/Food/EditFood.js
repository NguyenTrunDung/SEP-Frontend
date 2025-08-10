import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Select, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { validateImageFile, createImagePreview, cleanupImagePreview, getImageUrlWithFallback } from '../../../utils/imageUtils';
import PropTypes from 'prop-types';
import '../Area/Area.css'; // Reuse Area.css for floating label styles

const { Text } = Typography;

const EditFood = ({ open, onCancel, onSubmit, formData }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const { categories } = useFoodCategories();

  useEffect(() => {
    if (formData && open) {
      console.log('🔄 EditFood - Setting form data:', formData);
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        priceForGuest: formData.priceForGuest,
        priceForPatient: formData.priceForPatient,
        priceForStaff: formData.priceForStaff,
        sort: formData.sort,
        imageUrl: formData.imageUrl || '',
        isAddOn: formData.isAddOn || false,
        isSetDish: formData.isSetDish || false,
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
  }, [formData, open, form, resetForm, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        console.log('🧹 EditFood - Cleaning up preview URL:', previewUrl);
        cleanupImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFormSubmit = async (values) => {
    console.log('🚀 EditFood - Form submit with values:', values);
    const normalizedName = values.name.trim().toLowerCase();
    if (!normalizedName) {
      form.setFields([
        {
          name: 'name',
          errors: ['Tên món ăn không được để trống!'],
        },
      ]);
      return;
    }

    const result = await handleSubmit(async (formData) => {
      if (imageRemoved) {
        console.log('🗑️ Image was removed, clearing image data');
        formData.imageUrl = '';
      }
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

    console.log('📁 EditFood - New image file selected:', file.name);
    if (previewUrl) {
      console.log('🧹 EditFood - Cleaning up existing preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
    }

    setImageFile(file);
    setImageRemoved(false);
    const preview = createImagePreview(file);
    console.log('🖼️ EditFood - Created new preview URL:', preview);
    setPreviewUrl(preview);
    message.success('Hình ảnh đã được chọn!');
    return false;
  };

  const handleRemoveImage = () => {
    console.log('🗑️ EditFood - Removing image');
    if (previewUrl) {
      console.log('🧹 EditFood - Cleaning up preview URL:', previewUrl);
      cleanupImagePreview(previewUrl);
      setPreviewUrl('');
    }
    setImageFile(null);
    setImageRemoved(true);
    message.info('Hình ảnh đã được xóa!');
  };

  const getCurrentImageSrc = () => {
    if (imageRemoved) return null;
    if (previewUrl) return previewUrl;
    if (existingImageUrl) return getImageUrlWithFallback(existingImageUrl, '/images/placeholder-food.png');
    return null;
  };

  const hasImage = !!imageFile || (!!existingImageUrl && !imageRemoved);
  const currentImageSrc = getCurrentImageSrc();

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Chỉnh sửa</span>}
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
            loading={formLoading}
            disabled={formLoading}
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

      <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="sort" hidden>
          <Input />
        </Form.Item>

        <div className="custom-floating">
          <label className="floating-label">Tên món ăn</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên món ăn!' },
              { whitespace: true, message: 'Tên món ăn không được chỉ chứa khoảng trắng!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input className="input-label" placeholder="Tên món ăn" />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Danh mục</label>
          <Form.Item
            name="categoryId"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              className="input-label"
              placeholder="Chọn danh mục"
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Mô tả</label>
          <Form.Item name="description" style={{ marginBottom: 0 }}>
            <Input.TextArea className="input-label" placeholder="Mô tả món ăn" rows={4} />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Giá cho khách</label>
          <Form.Item
            name="priceForGuest"
            rules={[{ required: true, message: 'Vui lòng nhập giá cho khách!' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              className="input-label"
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Giá cho bệnh nhân</label>
          <Form.Item
            name="priceForPatient"
            rules={[{ required: true, message: 'Vui lòng nhập giá cho bệnh nhân!' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              className="input-label"
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Giá cho nhân viên</label>
          <Form.Item
            name="priceForStaff"
            rules={[{ required: true, message: 'Vui lòng nhập giá cho nhân viên!' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              className="input-label"
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Hình ảnh món ăn</label>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                name="image"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".png,.jpg,.jpeg"
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{
                    width: '100%',
                    height: 32,
                    fontSize: 14,
                    borderColor: '#d9d9d9',
                  }}
                >
                  Chọn hình ảnh
                </Button>
              </Upload>
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
                        {imageFile
                          ? `${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)`
                          : 'Hình ảnh hiện tại'}
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
              {imageRemoved && !imageFile && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <Text type="secondary">Hình ảnh đã được xóa</Text>
                </div>
              )}
            </Space>
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

EditFood.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object,
};

export default EditFood;