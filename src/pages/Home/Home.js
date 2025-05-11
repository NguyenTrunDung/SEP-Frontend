import React, { useState } from 'react';
import { Layout, BackTop, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import CarouselComponent from '../../components/CarouselComponent';
import MenuComponent from '../../components/Menu';
import ContactComponent from '../../components/Contact';
import FooterComponent from '../../components/Footer';

const { Content, Sider } = Layout;

const HomePage = () => {
  // Mock authentication state (replace with actual auth logic, e.g., from context or auth provider)
  const [user, setUser] = useState(null); // null means not logged in
  const [collapsed, setCollapsed] = useState(false);

  // Mock login function for admin (replace with actual login logic)
  const handleLoginAsAdmin = () => {
    setUser({ role: 'admin' });
  };

  // Mock logout function
  const handleLogout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isAdmin && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
          trigger={null}
          style={{
            background: '#001529',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 20,
          }}
        >
          <div
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: collapsed ? 'center' : 'space-between',
              alignItems: 'center',
              background: '#001529',
            }}
          >
            {!collapsed && <span style={{ color: '#fff', fontSize: '18px' }}>Admin Panel</span>}
            <div
              onClick={toggleCollapsed}
              style={{ color: '#fff', cursor: 'pointer', fontSize: '20px' }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && toggleCollapsed()}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <UserOutlined />,
                label: 'Manage Users',
                onClick: () => console.log('Navigate to Manage Users'),
              },
              {
                key: '2',
                icon: <FileTextOutlined />,
                label: 'Manage Menu',
                onClick: () => console.log('Navigate to Manage Menu'),
              },
              {
                key: '3',
                icon: <ShoppingCartOutlined />,
                label: 'Manage Orders',
                onClick: () => console.log('Navigate to Manage Orders'),
              },
              {
                key: '4',
                icon: <UserOutlined />,
                label: 'Logout',
                onClick: handleLogout,
              },
            ]}
          />
        </Sider>
      )}
      <Layout>
        <Navbar />
        <Content
          style={{
            padding: '16px',
            background: '#fff',
            marginLeft: isAdmin && !collapsed ? '200px' : isAdmin && collapsed ? '80px' : '0',
            transition: 'margin-left 0.2s',
          }}
        >
          {/* Mock login button for testing (remove in production) */}
          {!isAdmin && (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <button
                onClick={handleLoginAsAdmin}
                style={{
                  padding: '8px 16px',
                  background: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Login as Admin
              </button>
            </div>
          )}
          <div id="home">
            <CarouselComponent />
          </div>
          <div id="menu">
            <MenuComponent />
          </div>
          <div id="contact">
            <ContactComponent />
          </div>
        </Content>
        <BackTop>
          <div
            style={{
              height: 40,
              width: 40,
              borderRadius: '50%',
              backgroundColor: '#1088e9',
              color: '#fff',
              textAlign: 'center',
              lineHeight: '40px',
              fontSize: '20px',
            }}
          >
            ↑
          </div>
        </BackTop>
        <FooterComponent />
      </Layout>
    </Layout>
  );
};

export default HomePage;