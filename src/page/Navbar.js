import React, { useState } from 'react';
import { Layout, Menu, Input, Row, Col, Modal, List } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-scroll';

const { Header } = Layout;

const Navbar = () => {
  const branches = [
    { label: 'Chi nhánh 1', key: 'branch1' },
    { label: 'Chi nhánh 2', key: 'branch2' },
    { label: 'Chi nhánh 3 hihi haha', key: 'branch3' },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const showModal = () => setIsModalVisible(true);
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch.label);
    setIsModalVisible(false);
  };
  const handleCancel = () => setIsModalVisible(false);

  return (
    <Header
      style={{
        backgroundColor: '#000',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        lineHeight: '50px',
      }}
    >
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18}>
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <span
                style={{
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Hotline: 028 3840 8379
              </span>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                size="middle"
                style={{
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '250px',
                  backgroundColor: '#fff',
                  paddingLeft: '16px',
                }}
                aria-label="Search input"
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Row justify="end">
            <Col>
              <span
                onClick={showModal}
                style={{
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  border: '1px solid #fff',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && showModal()}
              >
                {selectedBranch ? `Branch: ${selectedBranch}` : 'Select branch'}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row align="middle" style={{ backgroundColor: '#fff', padding: '0px 4px' }}>
        <Col xs={12} sm={6} md={4}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{
              height: 'clamp(40px, 8vw, 60px)',
              objectFit: 'contain',
            }}
          />
        </Col>
        <Col xs={12} sm={18} md={20}>
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['home']}
            style={{
              borderBottom: 'none',
              justifyContent: 'flex-end',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              marginTop: '4px',
            }}
            items={[
              { key: 'home', label: <Link to="home" smooth={true} duration={500}>Home</Link> },
              { key: 'menu', label: <Link to="menu" smooth={true} duration={500}>Menu</Link> },
              { key: 'order', label: 'Order' },
              { key: 'staff', label: 'Staff' },
              { key: 'contact', label: <Link to="contact" smooth={true} duration={500}>Contact</Link> },
              {
                key: 'login',
                label: (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#000',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#000')}
                  >
                    <UserOutlined />
                  </div>
                ),
              },
            ]}
            overflowedIndicator={<span style={{ fontSize: '16px' }}>☰</span>}
          />
        </Col>
      </Row>

      <Modal
        title="Select Branch"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width="min(90vw, 400px)"
      >
        <List
          dataSource={branches}
          renderItem={(branch) => (
            <List.Item
              onClick={() => handleBranchSelect(branch)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              role="option"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleBranchSelect(branch)}
            >
              {branch.label}
            </List.Item>
          )}
        />
      </Modal>
    </Header>
  );
};

export default Navbar;