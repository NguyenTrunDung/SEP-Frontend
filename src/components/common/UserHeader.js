import React from 'react';
import { Avatar, Dropdown, Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  guestMode = false,
  showGuestButtons = true,
  guestButtonStyle = 'button',
  onAvatarClick = null,
  useCustomModal = false
}) => {
  const { logout, user, token, loading, loginType } = useAuth();
  const navigate = useNavigate();

  // Determine if user is authenticated based on available data
  const isAuthenticated = !!(user && token);

  // Debug logging (enable only when needed for troubleshooting)
  // console.log('UserHeader - Debug info:', {
  //   user: user ? { email: user.email, role: user.role } : null,
  //   hasToken: !!token,
  //   isAuthenticated,
  //   loading,
  //   guestMode
  // });

  if (user?.email) {
    localStorage.setItem('userEmail', user.email);
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await logout();

      if (onLogout) {
        onLogout();
      }

      // Navigate based on original login type for better UX
      const redirectPath = loginType === 'internal' ? '/login' : '/';
      console.log(`🔄 Redirecting to ${redirectPath} (loginType: ${loginType})`);
      navigate(redirectPath);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still navigate based on login type even if logout API fails
      const redirectPath = loginType === 'internal' ? '/login' : '/';
      navigate(redirectPath);
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
    return "/admin/profile"; // Unified profile route for all relevant roles
  };

  // Handle menu item click
  const handleMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate(getProfileRoute());
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  // Build user dropdown menu items for authenticated users
  const buildUserMenuItems = () => {
    return [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Thông tin cá nhân",
      },
      ...additionalMenuItems,
      ...(additionalMenuItems.length > 0 ? [{ type: 'divider' }] : []),
      {
        type: 'divider'
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
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
          <a onClick={handleLogin} style={{ fontSize: '15px', color: '#1890ff' }}>
            Đăng nhập
          </a>
          <a onClick={handleRegister} style={{ fontSize: '15px', color: '#1890ff' }}>
            Đăng ký
          </a>
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
          onClick={onAvatarClick || (() => navigate(getProfileRoute()))}
          style={{
            backgroundColor: '#1890ff',
            cursor: 'pointer'
          }}
        />
      ) : (
        <Dropdown
          menu={{
            items: buildUserMenuItems(),
            onClick: handleMenuClick
          }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
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