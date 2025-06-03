import React from 'react';
import { Typography, Space, Button, Card, Row, Col, Statistic } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;

/**
 * PageWrapper HOC - Provides consistent page layout structure
 * Based on the menu page layout for UI consistency across all admin pages
 * 
 * Features:
 * - Consistent page header with title, description, and action buttons
 * - Optional statistics cards section
 * - Responsive design following Ant Design principles
 * - Full customization while maintaining layout consistency
 */
const withPageWrapper = (WrappedComponent) => {
    const PageWrapperComponent = ({
        pageTitle,
        pageDescription,
        pageIcon = '📄',
        primaryButton,
        secondaryButtons = [],
        loading = false,
        onRefresh,
        refreshText = 'Làm mới',
        showRefresh = true,
        containerStyle = {},
        statistics = [],
        showStatistics = false,
        children,
        ...props
    }) => {
        const handleRefresh = () => {
            if (onRefresh) {
                onRefresh();
            }
        };

        // Default container style matching menu page
        const defaultContainerStyle = {
            maxWidth: '1600px',
            margin: '0 auto',
            background: '#f5f5f5',
            minHeight: '100vh',
            ...containerStyle
        };

        // Render statistics cards
        const renderStatistics = () => {
            if (!showStatistics || !statistics.length) return null;

            return (
                <Row gutter={[24, 24]}>
                    {statistics.map((stat, index) => (
                        <Col xs={24} sm={24 / Math.min(statistics.length, 4)} key={index}>
                            <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                                <Statistic
                                    title={
                                        <span style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {stat.title}
                                        </span>
                                    }
                                    value={stat.value}
                                    prefix={stat.icon}
                                    suffix={stat.suffix}
                                    valueStyle={{
                                        fontSize: '2rem',
                                        fontWeight: '700',
                                        color: stat.color || undefined,
                                        ...stat.valueStyle
                                    }}
                                    precision={stat.precision}
                                    formatter={stat.formatter}
                                    {...stat.props}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        };

        return (
            <div style={defaultContainerStyle}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Page Header Card */}
                    <Card style={{ borderRadius: '12px' }}>
                        <Row justify="space-between" align="middle" gutter={[24, 24]}>
                            <Col xs={24} lg={12}>
                                <div>
                                    <Title level={1} style={{
                                        margin: 0,
                                        fontSize: '2.2rem',
                                        fontWeight: '600',
                                        color: '#262626'
                                    }}>
                                        {pageIcon} {pageTitle}
                                    </Title>
                                    {pageDescription && (
                                        <Paragraph style={{
                                            margin: '12px 0 0 0',
                                            fontSize: '1.1rem',
                                            color: '#595959'
                                        }}>
                                            {pageDescription}
                                        </Paragraph>
                                    )}
                                </div>
                            </Col>

                            <Col xs={24} lg={12}>
                                <div style={{ textAlign: 'right' }}>
                                    <Space size="large" wrap>
                                        {/* Secondary buttons */}
                                        {secondaryButtons.map((button, index) => (
                                            <Button
                                                key={index}
                                                icon={button.icon}
                                                onClick={button.onClick}
                                                loading={button.loading || loading}
                                                type={button.type || 'default'}
                                                danger={button.danger}
                                                disabled={button.disabled}
                                                style={{
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '0 24px',
                                                    ...button.style
                                                }}
                                                {...(button.props || {})}
                                            >
                                                {button.text}
                                            </Button>
                                        ))}

                                        {/* Refresh button */}
                                        {showRefresh && (
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={handleRefresh}
                                                style={{
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '0 24px'
                                                }}
                                                loading={loading}
                                            >
                                                {refreshText}
                                            </Button>
                                        )}

                                        {/* Primary button */}
                                        {primaryButton && (
                                            <Button
                                                type="primary"
                                                icon={primaryButton.icon}
                                                onClick={primaryButton.onClick}
                                                loading={primaryButton.loading || loading}
                                                disabled={primaryButton.disabled}
                                                style={{
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    padding: '0 32px',
                                                    ...primaryButton.style
                                                }}
                                                {...(primaryButton.props || {})}
                                            >
                                                {primaryButton.text}
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Statistics Cards */}
                    {renderStatistics()}

                    {/* Wrapped Component Content */}
                    <WrappedComponent {...props}>
                        {children}
                    </WrappedComponent>
                </Space>
            </div>
        );
    };

    // Set display name for debugging
    PageWrapperComponent.displayName = `withPageWrapper(${WrappedComponent.displayName || WrappedComponent.name})`;

    // PropTypes for the wrapper
    PageWrapperComponent.propTypes = {
        pageTitle: PropTypes.string.isRequired,
        pageDescription: PropTypes.string,
        pageIcon: PropTypes.string,
        primaryButton: PropTypes.shape({
            text: PropTypes.string.isRequired,
            icon: PropTypes.node,
            onClick: PropTypes.func.isRequired,
            loading: PropTypes.bool,
            disabled: PropTypes.bool,
            style: PropTypes.object,
            props: PropTypes.object
        }),
        secondaryButtons: PropTypes.arrayOf(
            PropTypes.shape({
                text: PropTypes.string.isRequired,
                icon: PropTypes.node,
                onClick: PropTypes.func.isRequired,
                loading: PropTypes.bool,
                disabled: PropTypes.bool,
                type: PropTypes.string,
                danger: PropTypes.bool,
                style: PropTypes.object,
                props: PropTypes.object
            })
        ),
        loading: PropTypes.bool,
        onRefresh: PropTypes.func,
        refreshText: PropTypes.string,
        showRefresh: PropTypes.bool,
        containerStyle: PropTypes.object,
        statistics: PropTypes.arrayOf(
            PropTypes.shape({
                title: PropTypes.string.isRequired,
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                icon: PropTypes.node,
                suffix: PropTypes.string,
                color: PropTypes.string,
                precision: PropTypes.number,
                formatter: PropTypes.func,
                valueStyle: PropTypes.object,
                props: PropTypes.object
            })
        ),
        showStatistics: PropTypes.bool,
        children: PropTypes.node,
    };

    return PageWrapperComponent;
};

export default withPageWrapper; 