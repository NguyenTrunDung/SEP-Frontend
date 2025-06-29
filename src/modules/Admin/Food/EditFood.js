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

const EditFood = ({ open, onCancel, onSubmit, formData }) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [imageRemoved, setImageRemoved] = useState(false);
    const { categories } = useFoodCategories(); // Use branch-aware hook

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
                sort: formData.sort, // Include sort field for edit operations
                imageUrl: formData.imageUrl || '',
                isAddOn: formData.isAddOn || false,
                isSetDish: formData.isSetDish || false,
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
                console.log('🧹 EditFood - Component unmounting - cleaning up preview URL:', previewUrl);
                cleanupImagePreview(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFormSubmit = async (values) => {
        console.log('🚀 EditFood - Form submit with values:', values);
        console.log('🚀 EditFood - Image state:', {
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

        console.log('📁 EditFood - New image file selected:', file.name);

        // Clean up existing preview BEFORE creating new one
        if (previewUrl) {
            console.log('🧹 EditFood - Cleaning up existing preview URL:', previewUrl);
            cleanupImagePreview(previewUrl);
        }

        // Set the new file and reset removal flag
        setImageFile(file);
        setImageRemoved(false); // Reset removed flag when new file is selected

        // Create new preview URL
        const preview = createImagePreview(file);
        console.log('🖼️ EditFood - Created new preview URL:', preview);
        setPreviewUrl(preview);

        message.success('Hình ảnh đã được chọn để tải lên server!');
        return false; // Prevent auto upload
    };

    const handleRemoveImage = () => {
        console.log('🗑️ EditFood - Removing image');

        // Clean up preview URL if it exists
        if (previewUrl) {
            console.log('🧹 EditFood - Cleaning up preview URL on removal:', previewUrl);
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
            title="Sửa Món Ăn"
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

                <Form.Item label="Hình ảnh món ăn">
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
                            Cập nhật món ăn
                        </Button>
                    </Space>
                </Form.Item>
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