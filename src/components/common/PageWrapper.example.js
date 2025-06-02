import React, { useState } from 'react';
import { message, Table } from 'antd';
import { PlusOutlined, ExportOutlined, UserOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons';
import withPageWrapper from './PageWrapper';

/**
 * Example 1: Simple page with just title and primary button
 */
const SimplePageComponent = ({ children }) => {
    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <h3>Page Content Here</h3>
            <p>This is where your main page content would go.</p>
            {children}
        </div>
    );
};

const SimplePage = withPageWrapper(SimplePageComponent);

const SimplePageExample = () => {
    const handleCreate = () => {
        message.success('Create button clicked!');
    };

    const handleRefresh = () => {
        message.success('Page refreshed!');
    };

    return (
        <SimplePage
            pageTitle="Simple Page"
            pageDescription="This is a basic page example with minimal configuration"
            pageIcon="📝"
            primaryButton={{
                text: 'Create New',
                icon: <PlusOutlined />,
                onClick: handleCreate
            }}
            onRefresh={handleRefresh}
        >
            <p>Custom content passed as children</p>
        </SimplePage>
    );
};

/**
 * Example 2: Advanced page with statistics and multiple buttons
 */
const AdvancedPageComponent = ({ children }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
        },
    ];

    const data = [
        {
            key: '1',
            name: 'Item 1',
            status: 'Active',
            created: '2024-01-01',
        },
        {
            key: '2',
            name: 'Item 2',
            status: 'Inactive',
            created: '2024-01-02',
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            pagination={{ pageSize: 10 }}
            style={{ background: '#fff', borderRadius: '8px' }}
        />
    );
};

const AdvancedPage = withPageWrapper(AdvancedPageComponent);

const AdvancedPageExample = () => {
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('Item created successfully!');
        }, 2000);
    };

    const handleExport = () => {
        message.info('Exporting data...');
    };

    const handleBulkDelete = () => {
        message.warning('Bulk delete functionality');
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('Data refreshed!');
        }, 1000);
    };

    return (
        <AdvancedPage
            pageTitle="Advanced Management"
            pageDescription="Complete example with statistics, multiple buttons, and advanced features"
            pageIcon="🚀"
            loading={loading}

            // Primary action button
            primaryButton={{
                text: 'Create New Item',
                icon: <PlusOutlined />,
                onClick: handleCreate,
                loading: loading
            }}

            // Secondary action buttons
            secondaryButtons={[
                {
                    text: 'Export Data',
                    icon: <ExportOutlined />,
                    onClick: handleExport
                },
                {
                    text: 'Bulk Delete',
                    icon: <UserOutlined />,
                    onClick: handleBulkDelete,
                    danger: true
                }
            ]}

            // Statistics cards
            showStatistics={true}
            statistics={[
                {
                    title: 'Total Items',
                    value: 1234,
                    icon: <ShoppingCartOutlined />,
                    color: '#1890ff'
                },
                {
                    title: 'Active Items',
                    value: 987,
                    icon: <UserOutlined />,
                    color: '#52c41a'
                },
                {
                    title: 'This Month',
                    value: 156,
                    icon: <CalendarOutlined />,
                    color: '#fa8c16'
                },
                {
                    title: 'Revenue',
                    value: 45678,
                    prefix: '$',
                    precision: 2,
                    color: '#eb2f96'
                }
            ]}

            onRefresh={handleRefresh}
        />
    );
};

/**
 * Example 3: Custom styled page
 */
const CustomStyledPageComponent = ({ children }) => {
    return (
        <div style={{
            padding: '32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white',
            minHeight: '400px'
        }}>
            <h2 style={{ color: 'white', marginBottom: '24px' }}>Custom Styled Content</h2>
            <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
                This example shows how you can customize the content area while maintaining
                the consistent header layout provided by the PageWrapper HOC.
            </p>
            {children}
        </div>
    );
};

const CustomStyledPage = withPageWrapper(CustomStyledPageComponent);

const CustomStyledPageExample = () => {
    return (
        <CustomStyledPage
            pageTitle="Custom Styled Page"
            pageDescription="Example showing custom styling capabilities"
            pageIcon="🎨"
            containerStyle={{
                background: 'linear-gradient(to bottom, #f0f2f5, #e6f7ff)',
            }}
            showRefresh={false}
            primaryButton={{
                text: 'Custom Action',
                onClick: () => message.info('Custom action triggered!'),
                style: {
                    background: '#722ed1',
                    borderColor: '#722ed1'
                }
            }}
        />
    );
};

/**
 * Example 4: Page without refresh button
 */
const MinimalPageComponent = () => {
    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <h3>Minimal Page Example</h3>
            <p>This page doesn't have a refresh button and shows minimal configuration.</p>
        </div>
    );
};

const MinimalPage = withPageWrapper(MinimalPageComponent);

const MinimalPageExample = () => {
    return (
        <MinimalPage
            pageTitle="Minimal Page"
            pageDescription="Simple page without refresh button"
            pageIcon="📄"
            showRefresh={false}
        />
    );
};

// Export all examples
export {
    SimplePageExample,
    AdvancedPageExample,
    CustomStyledPageExample,
    MinimalPageExample
};

// Default export with all examples for demo purposes
const PageWrapperExamples = () => {
    return (
        <div>
            <h1>PageWrapper HOC Examples</h1>

            <div style={{ marginBottom: '48px' }}>
                <h2>1. Simple Page Example</h2>
                <SimplePageExample />
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h2>2. Advanced Page Example</h2>
                <AdvancedPageExample />
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h2>3. Custom Styled Page Example</h2>
                <CustomStyledPageExample />
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h2>4. Minimal Page Example</h2>
                <MinimalPageExample />
            </div>
        </div>
    );
};

export default PageWrapperExamples; 