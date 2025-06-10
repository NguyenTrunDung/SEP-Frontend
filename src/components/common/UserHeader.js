import React from 'react';
import { Avatar, Dropdown, Typography, Button, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const { Text } = Typography;

const UserHeader = ({
    style = {},
    avatarSize = "default",
    showGreeting = true,
    greetingStyle = {},
    onLogout,
    additionalMenuItems = [],
    guestMode = false, // New prop to handle guest layout
    showGuestButtons = true, // Whether to show login/register for guests
    guestButtonStyle = 'button', // 'button' or 'link'
    onAvatarClick = null, // Custom click handler for avatar (overrides dropdown)
    useCustomModal = false // Whether to use custom modal instead of dropdown
}) => {
    const { logout, user, token, loading } = useAuth();
    const navigate = useNavigate();

    // Determine if user is authenticated based on available data
    const isAuthenticated = !!(user && token);

    // Debug logging to help troubleshoot
    console.log('UserHeader - Debug info:', {
        user: user ? { email: user.email, role: user.role } : null,
        hasToken: !!token,
        isAuthenticated,
        loading,
        guestMode
    });

    const handleLogout = () => {
        logout();
        if (onLogout) {
            onLogout();
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    // Get profile route based on user role
    const getProfileRoute = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return "/admin/profile";
            case ROLES.DOCTOR:
                return "/doctor/profile";
            case ROLES.PATIENT:
                return "/patient/profile";
            case ROLES.STAFF:
                return "/staff/profile";
            default:
                return "/profile"; // Default profile route for other roles
        }
    };

    // Check if user has management roles
    const hasManagementRole = () => {
        return user?.role && [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF].includes(user.role);
    };

    // Build user dropdown menu items for authenticated users
    const buildUserMenuItems = () => {
        const baseItems = [
            {
                key: "profile",
                icon: <UserOutlined />,
                label: (
                    <Link
                        to={getProfileRoute()}
                        style={{ fontSize: '15px' }}
                    >
                        Thông tin cá nhân
                    </Link>
                )
            }
        ];

        // Add management dashboard link for management roles
        if (hasManagementRole()) {
            baseItems.push({
                key: "dashboard",
                icon: <UserOutlined />,
                label: (
                    <Link
                        to="/dashboard"
                        style={{ fontSize: '15px' }}
                    >
                        Bảng điều khiển
                    </Link>
                )
            });
        }

        return [
            ...baseItems,
            // Add any additional menu items passed as props
            ...additionalMenuItems,
            // Add divider if there are additional items
            ...(additionalMenuItems.length > 0 ? [{ type: 'divider' }] : []),
            {
                type: 'divider'
            },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: <span style={{ fontSize: '15px' }}>Đăng xuất</span>,
                onClick: handleLogout,
                style: { color: '#ff4d4f' }
            }
        ];
    };

    // Render guest buttons for non-authenticated users
    const renderGuestButtons = () => {
        if (!showGuestButtons) return null;

        if (guestButtonStyle === 'link') {
            return (
                <Space size="large">
                    <Link to="/login" style={{ fontSize: '15px', color: '#1890ff' }}>
                        Đăng nhập
                    </Link>
                    <Link to="/register" style={{ fontSize: '15px', color: '#1890ff' }}>
                        Đăng ký
                    </Link>
                </Space>
            );
        }

        return (
            <Space>
                <Button
                    type="default"
                    icon={<LoginOutlined />}
                    onClick={handleLogin}
                    size="middle"
                >
                    Đăng nhập
                </Button>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleRegister}
                    size="middle"
                >
                    Đăng ký
                </Button>
            </Space>
        );
    };

    const defaultStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...style
    };

    const defaultGreetingStyle = {
        fontSize: '15px',
        color: '#666',
        ...greetingStyle
    };

    // Show nothing while loading to prevent flicker
    if (loading && !guestMode) {
        return <div style={defaultStyle}></div>;
    }

    // Handle different modes: guest vs authenticated
    if (guestMode || !isAuthenticated) {
        return (
            <div style={defaultStyle}>
                {renderGuestButtons()}
            </div>
        );
    }

    // Authenticated user display
    return (
        <div style={defaultStyle}>
            {showGreeting && (
                <Text style={defaultGreetingStyle}>
                    Xin chào, <strong style={{ color: '#262626' }}>
                        {user?.firstName || user?.lastName || user?.email}
                    </strong>
                </Text>
            )}

            {/* Use custom modal if specified, otherwise use dropdown */}
            {useCustomModal || onAvatarClick ? (
                <Avatar
                    size={avatarSize}
                    icon={<UserOutlined />}
                    onClick={onAvatarClick || (() => { })}
                    style={{
                        backgroundColor: '#1890ff',
                        cursor: 'pointer'
                    }}
                />
            ) : (
                <Dropdown menu={{ items: buildUserMenuItems() }} placement="bottomRight" arrow>
                    <Avatar
                        size={avatarSize}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: '#1890ff',
                            cursor: 'pointer'
                        }}
                    />
                </Dropdown>
            )}
        </div>
    );
};

export default UserHeader; 