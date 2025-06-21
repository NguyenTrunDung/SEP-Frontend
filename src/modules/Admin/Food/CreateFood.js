import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Select, Upload, Radio } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import PropTypes from 'prop-types';

const { Dragger } = Upload;

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
  const [localImageFile, setLocalImageFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('cloudinary'); // 'cloudinary' or 'local'
  const { categories } = useFoodCategories(); // Use branch-aware hook

  useEffect(() => {
    if (formData) {
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
      });
      setImageUrl(formData.imageUrl || '');
      // If editing and has image URL, default to cloudinary method
      if (formData.imageUrl) {
        setUploadMethod('cloudinary');
      }
    } else {
      form.setFieldsValue(initialValues);
      setImageUrl('');
      setLocalImageFile(null);
    }
  }, [formData, initialValues, form]);

  const handleFormSubmit = async (values) => {
    const result = await handleSubmit(async (formData) => {
      // Prepare the image data based on upload method
      let imageFile = null;
      
      if (uploadMethod === 'local' && localImageFile) {
        imageFile = localImageFile;
      } else if (uploadMethod === 'cloudinary' && imageUrl) {
        // For Cloudinary, we'll store the URL in the description or a separate field
        // Since the backend expects a file upload, we might need to modify this approach
        formData.imageUrl = imageUrl;
      }

      if (onSubmit) {
        await onSubmit(formData, imageFile);
      }
    });

    if (result.success) {
      // Success message is handled in the mutation hooks
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    setImageUrl('');
    setLocalImageFile(null);
    setUploadMethod('cloudinary');
    if (onCancel) {
      onCancel();
    }
  };

  const handleCloudinaryUpload = (url) => {
    setImageUrl(url);
    setLocalImageFile(null); // Clear local file if using Cloudinary
    form.setFieldsValue({ imageUrl: url });
    message.success('Hình ảnh đã được tải lên Cloudinary thành công!');
  };

  const handleLocalFileChange = (info) => {
    const { fileList } = info;
    
    if (fileList.length > 0) {
      const file = fileList[0];
      if (file.status !== 'error') {
        setLocalImageFile(file.originFileObj || file);
        setImageUrl(''); // Clear Cloudinary URL if using local file
        form.setFieldsValue({ imageUrl: '' });
        message.success('Tệp hình ảnh đã được chọn!');
      }
    } else {
      setLocalImageFile(null);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: () => {
      return false; // Prevent automatic upload
    },
    onChange: handleLocalFileChange,
    onDrop: handleLocalFileChange,
    maxCount: 1,
  };

  const getCurrentImagePreview = () => {
    if (uploadMethod === 'cloudinary' && imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Food Preview"
          style={{ 
            maxWidth: '150px', 
            maxHeight: '150px', 
            objectFit: 'cover', 
            borderRadius: '4px', 
            marginTop: 8 
          }}
        />
      );
    }
    
    if (uploadMethod === 'local' && localImageFile) {
      const previewUrl = localImageFile instanceof File 
        ? URL.createObjectURL(localImageFile)
        : localImageFile.url;
      
      return (
        <img
          src={previewUrl}
          alt="Food Preview"
          style={{ 
            maxWidth: '150px', 
            maxHeight: '150px', 
            objectFit: 'cover', 
            borderRadius: '4px', 
            marginTop: 8 
          }}
        />
      );
    }
    
    return null;
  };

  return (
    <ReusableModal
      title={formData && formData.id ? 'Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
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

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Nhập mô tả món ăn" rows={4} />
        </Form.Item>

        <Form.Item
          name="priceForGuest"
          label="Giá cho khách"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho khách!' }]}
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
          name="priceForPatient"
          label="Giá cho bệnh nhân"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho bệnh nhân!' }]}
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
          name="priceForStaff"
          label="Giá cho nhân viên"
          rules={[{ required: true, message: 'Vui lòng nhập giá cho nhân viên!' }]}
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
          name="sort"
          label="Thứ tự sắp xếp"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự sắp xếp!' }]}
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            readOnly
            onKeyDown={(e) => e.preventDefault()} 
            onMouseDown={(e) => e.preventDefault()} 
          />
        </Form.Item>

        <Form.Item label="Phương thức tải ảnh">
          <Radio.Group 
            value={uploadMethod} 
            onChange={(e) => setUploadMethod(e.target.value)}
          >
            <Radio value="cloudinary">Cloudinary (Online)</Radio>
            <Radio value="local">Tải file lên server</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Hình ảnh">
          <Space direction="vertical" style={{ width: '100%' }}>
            {uploadMethod === 'cloudinary' ? (
              <Button
                icon={<UploadOutlined />}
                onClick={() => openCloudinaryWidget(handleCloudinaryUpload)}
                style={{ width: '100%' }}
              >
                Tải lên Cloudinary
              </Button>
            ) : (
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Nhấn hoặc kéo thả tệp vào khu vực này để tải lên
                </p>
                <p className="ant-upload-hint">
                  Hỗ trợ tải lên một tệp hình ảnh (PNG, JPG, JPEG)
                </p>
              </Dragger>
            )}
            
            {getCurrentImagePreview()}
            
            <Form.Item name="imageUrl" hidden>
              <Input />
            </Form.Item>
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
    priceForPatient: PropTypes.number,
    priceForStaff: PropTypes.number,
    sort: PropTypes.number,
    imageUrl: PropTypes.string,
  }),
};

export default CreateFood;