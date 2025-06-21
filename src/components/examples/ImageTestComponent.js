import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider, Row, Col, message } from 'antd';
import { FoodImage, AvatarImage } from '../common/ImageDisplay';
import { getImageUrl, validateImageFile, createImagePreview } from '../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

/**
 * Test component to demonstrate image loading from server uploads
 */
const ImageTestComponent = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Test images from the server uploads folder
    const testImages = [
        '25e414b9-35b1-4ae5-a314-f6a6468b7324.jpg',
        '469e2b61-ebba-450c-8586-7aaea397f774.png',
        '98765544-63ac-474a-bafa-946dcffb6486.jpg',
        'b85f8ff9-63c0-4e7b-9b8d-2b5ba5797289.jpg'
    ];

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.isValid) {
            message.error(validation.error);
            return;
        }

        setSelectedFile(file);
        const preview = createImagePreview(file);
        setPreviewUrl(preview);
        message.success(`File selected: ${file.name}`);
    };

    const testImageUrl = (imagePath) => {
        const url = getImageUrl(imagePath);
        console.log('Image path:', imagePath, '→ URL:', url);
        message.info(`Generated URL: ${url}`);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>Image Loading System Test</Title>
            <Paragraph>
                This component demonstrates how to load images from the server's uploads folder.
            </Paragraph>

            <Divider />

            <Title level={3}>Server Upload Images</Title>
            <Row gutter={[16, 16]}>
                {testImages.map((imageName, index) => (
                    <Col xs={12} sm={8} md={6} key={index}>
                        <Card
                            size="small"
                            title={`Image ${index + 1}`}
                            extra={
                                <Button
                                    size="small"
                                    onClick={() => testImageUrl(imageName)}
                                >
                                    Test URL
                                </Button>
                            }
                        >
                            <FoodImage
                                src={imageName}
                                alt={`Test food ${index + 1}`}
                                size="card"
                            />
                            <Text code style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                                {imageName}
                            </Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider />

            <Title level={3}>Different Image Sizes</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Text strong>Small Size (60x60):</Text>
                    <div style={{ marginTop: '8px' }}>
                        <FoodImage
                            src="25e414b9-35b1-4ae5-a314-f6a6468b7324.jpg"
                            size="small"
                            alt="Small food image"
                        />
                    </div>
                </div>

                <div>
                    <Text strong>Medium Size (120x120):</Text>
                    <div style={{ marginTop: '8px' }}>
                        <FoodImage
                            src="469e2b61-ebba-450c-8586-7aaea397f774.png"
                            size="medium"
                            alt="Medium food image"
                        />
                    </div>
                </div>

                <div>
                    <Text strong>Large Size (200x200):</Text>
                    <div style={{ marginTop: '8px' }}>
                        <FoodImage
                            src="98765544-63ac-474a-bafa-946dcffb6486.jpg"
                            size="large"
                            alt="Large food image"
                        />
                    </div>
                </div>
            </Space>

            <Divider />

            <Title level={3}>File Upload Preview Test</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {selectedFile && (
                    <div>
                        <Text strong>Selected File:</Text> {selectedFile.name}
                        <br />
                        <Text>Size:</Text> {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                )}
                {previewUrl && (
                    <div>
                        <Text strong>Preview:</Text>
                        <div style={{ marginTop: '8px' }}>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>
                    </div>
                )}
            </Space>
        </div>
    );
};

export default ImageTestComponent; 