import React from 'react';
import { Card, Typography, Divider } from 'antd';
import ImageDisplay from '../common/ImageDisplay';
import { getImageUrl } from '../../utils/imageUtils';
import imageConfig from '../../config/imageConfig';

const { Title, Text, Paragraph } = Typography;

const ImageTestComponent = () => {
    // Test with a sample image that should exist in uploads
    const testImagePath = '7c101bc9_009a0c14.jpg'; // Your actual image

    return (
        <Card title="Image CORS Test Component" style={{ margin: '20px' }}>
            <Title level={4}>Configuration Status</Title>
            <Paragraph>
                <Text strong>Use API Endpoint: </Text>
                <Text code>{imageConfig.useApiEndpoint ? 'TRUE (API)' : 'FALSE (Static Files)'}</Text>
            </Paragraph>

            <Paragraph>
                <Text strong>Generated URL: </Text>
                <Text code>{getImageUrl(testImagePath, imageConfig.useApiEndpoint)}</Text>
            </Paragraph>

            <Divider />

            <Title level={4}>Image Display Test</Title>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <Text strong>Using Configuration (Should work):</Text>
                    <div style={{ marginTop: '10px' }}>
                        <ImageDisplay
                            src={testImagePath}
                            alt="Test Image"
                            width={150}
                            height={150}
                        />
                    </div>
                </div>

                <div>
                    <Text strong>Force API Endpoint:</Text>
                    <div style={{ marginTop: '10px' }}>
                        <ImageDisplay
                            src={testImagePath}
                            alt="Test Image API"
                            width={150}
                            height={150}
                            useApiEndpoint={true}
                        />
                    </div>
                </div>

                <div>
                    <Text strong>Force Static Files:</Text>
                    <div style={{ marginTop: '10px' }}>
                        <ImageDisplay
                            src={testImagePath}
                            alt="Test Image Static"
                            width={150}
                            height={150}
                            useApiEndpoint={true}
                        />
                    </div>
                </div>
            </div>

            <Divider />

            <Title level={4}>URL Generation Test</Title>
            <Paragraph>
                <Text strong>Static File URL: </Text>
                <Text code>{getImageUrl(testImagePath, false)}</Text>
            </Paragraph>
            <Paragraph>
                <Text strong>API Endpoint URL: </Text>
                <Text code>{getImageUrl(testImagePath, true)}</Text>
            </Paragraph>

            <Divider />

            <Title level={4}>Instructions</Title>
            <ul>
                <li>Check browser console for CORS errors</li>
                <li>Check Network tab to see which URLs are being called</li>
                <li>If "Force API Endpoint" works but configuration doesn't, restart frontend</li>
                <li>If "Force Static Files" works, change useApiEndpoint to false in config</li>
            </ul>
        </Card>
    );
};

export default ImageTestComponent; 