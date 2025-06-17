import React, { useMemo } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import UserHeader from '../common/UserHeader';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const NurseLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const handleLogout = () => {
    navigate('/login');
  };

  const hasRequiredRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const canAccess = (allowedRoles = [], requiredPermissions = []) => {
    if (allowedRoles.length > 0 && hasRequiredRole(allowedRoles)) {
      return true;
    }
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some((permission) => hasPermission && hasPermission(permission));
    }
    return false;
  };

  const getSelectedMenuKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === '/nurse/patient') return ['patients'];
    if (pathname === '/patient-groups') return ['patient-groups'];
    return [];
  }, [location.pathname]);

  const headerStyle = {
    background: '#fff',
    padding: '0 24px',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: 24,
  };

  const menuStyle = {
    flex: 1,
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '64px',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={headerStyle}>
        <div style={logoStyle}>
          <Title level={3} style={{ margin: 0, color: '#1890ff', fontSize: '18px' }}>
            🏥 Hệ Thống Quản Lý
          </Title>
          <Text style={{ color: '#666', fontSize: '12px', marginLeft: 8 }}>
            Căn tin Bệnh viện
          </Text>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={getSelectedMenuKey}
          style={menuStyle}
          items={[
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.NURSE], ['patients:view']) && {
              key: 'patients',
              icon: <UserOutlined style={{ fontSize: '16px' }} />,
              label: <Link to="/nurse/patient">Quản lý bệnh nhân</Link>,
            },
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.NURSE], ['patient-groups:view']) && {
              key: 'patient-groups',
              icon: <TeamOutlined style={{ fontSize: '16px' }} />,
              label: <Link to="/patient-groups">Nhóm bệnh</Link>,
            },
          ].filter(Boolean)}
        />
        <UserHeader onLogout={handleLogout} />
      </Header>
      <Content style={{ margin: '24px 16px 0' }}>
        <div
          style={{
            padding: 24,
            background: '#fff',
            minHeight: 360,
            borderRadius: 8,
            border: '1px solid #f0f0f0',
          }}
        >
          {children}
        </div>
      </Content>
     
    </Layout>
  );
};

export default NurseLayout;