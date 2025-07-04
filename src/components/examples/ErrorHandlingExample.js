import React, { useState } from 'react';
import { Button, Card, Space, Typography, Divider } from 'antd';
import { handleMenuApiError, handleApiError } from '../../utils/errorHandler';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/**
 * Example component demonstrating the new error handling utilities
 * This shows how different types of API errors are transformed into user-friendly messages
 */
const ErrorHandlingExample = () => {
    const [errorMessage, setErrorMessage] = useState('');

    // Simulate different types of API errors
    const simulateErrors = {
        // 409 Conflict error for menu with date
        conflict: () => {
            const mockError = {
                response: {
                    status: 409,
                    data: { message: 'Menu already exists for this date' }
                }
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                date: dayjs().format('YYYY-MM-DD'),
                entityType: 'menu'
            });
            setErrorMessage(message);
        },

        // 400 Bad Request error
        badRequest: () => {
            const mockError = {
                response: {
                    status: 400,
                    data: { message: 'Invalid menu data provided' }
                }
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                entityType: 'menu'
            });
            setErrorMessage(message);
        },

        // 401 Unauthorized error
        unauthorized: () => {
            const mockError = {
                response: {
                    status: 401,
                    data: { message: 'Token expired' }
                }
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                entityType: 'menu'
            });
            setErrorMessage(message);
        },

        // 403 Forbidden error
        forbidden: () => {
            const mockError = {
                response: {
                    status: 403,
                    data: { message: 'Insufficient permissions' }
                }
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                entityType: 'menu'
            });
            setErrorMessage(message);
        },

        // 500 Server error
        serverError: () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Internal server error' }
                }
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                entityType: 'menu'
            });
            setErrorMessage(message);
        },

        // Network error
        networkError: () => {
            const mockError = {
                code: 'NETWORK_ERROR',
                message: 'Network Error'
            };
            const message = handleMenuApiError(mockError, {
                action: 'tạo',
                entityType: 'menu'
            });
            setErrorMessage(message);
        }
    };

    return (
        <Card title="Error Handling Example" style={{ maxWidth: 800, margin: '20px auto' }}>
            <Paragraph>
                This example demonstrates how the new error handling utility transforms 
                technical API errors into user-friendly Vietnamese messages.
            </Paragraph>

            <Title level={4}>Test Different Error Scenarios:</Title>
            
            <Space wrap>
                <Button onClick={simulateErrors.conflict} type="primary">
                    409 Conflict (Duplicate Date)
                </Button>
                <Button onClick={simulateErrors.badRequest}>
                    400 Bad Request
                </Button>
                <Button onClick={simulateErrors.unauthorized}>
                    401 Unauthorized
                </Button>
                <Button onClick={simulateErrors.forbidden}>
                    403 Forbidden
                </Button>
                <Button onClick={simulateErrors.serverError}>
                    500 Server Error
                </Button>
                <Button onClick={simulateErrors.networkError}>
                    Network Error
                </Button>
            </Space>

            <Divider />

            {errorMessage && (
                <Card 
                    size="small" 
                    style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7' }}
                >
                    <Title level={5} style={{ color: '#cf1322', margin: 0 }}>
                        Error Message:
                    </Title>
                    <Text style={{ color: '#cf1322' }}>{errorMessage}</Text>
                </Card>
            )}

            <Divider />

            <Title level={4}>Benefits of the New Error Handler:</Title>
            <ul>
                <li><strong>User-friendly messages</strong> in Vietnamese instead of technical error codes</li>
                <li><strong>Context-aware</strong> messages that include relevant information (like dates)</li>
                <li><strong>Consistent messaging</strong> across the entire application</li>
                <li><strong>Specific handling</strong> for menu-related operations</li>
                <li><strong>Reusable utility</strong> that can be used in any component</li>
            </ul>

            <Paragraph>
                <Text type="secondary">
                    The error handler automatically extracts meaningful information from the error 
                    (like dates for 409 conflicts) and provides actionable guidance to users.
                </Text>
            </Paragraph>
        </Card>
    );
};

export default ErrorHandlingExample; 