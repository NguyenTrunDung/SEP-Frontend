import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Row, Col, Modal, List, Spin, Alert } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Link as ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom';
import { useBranches } from '../hooks/queries/useBranches';

const { Header } = Layout;

const Navbar = () => {
  const { branches, loading, error } = useBranches();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Hiển thị modal ngay khi trang mở nếu chưa chọn chi nhánh
  useEffect(() => {
    if (!selectedBranch) {
      setIsModalVisible(true);
    }
  }, [selectedBranch]);

  const showModal = () => setIsModalVisible(true);
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    // Không cho đóng modal nếu chưa chọn chi nhánh
    if (selectedBranch) {
      setIsModalVisible(false);
    }
  };

  return (
    <Header style={{ backgroundColor: '#000', padding: '0 20px', position: 'sticky', top: 0, zIndex: 10 }}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18}>
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
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
              >
                {selectedBranch ? `Branch: ${selectedBranch.Name}` : 'Select branch'}
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
            style={{ height: 'clamp(40px, 8vw, 60px)', objectFit: 'contain' }}
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
              { key: 'home', label: <ScrollLink to="home" smooth={true} duration={500}>Home</ScrollLink> },
              { key: 'menu', label: <ScrollLink to="menu" smooth={true} duration={500}>Menu</ScrollLink> },
              { key: 'cart', label: <Link to="/cart">Cart</Link> },
              { key: 'staff', label: 'Staff' },
              { key: 'contact', label: <ScrollLink to="contact" smooth={true} duration={500}>Contact</ScrollLink> },
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
        open={isModalVisible}
        footer={null}
        centered
        closable={false}
        width="min(90vw, 400px)"
        style={{
          padding: 0,
          margin: 0,
          top: 0,
        }}
        modalRender={(node) => <div style={{ margin: 0, padding: 0 }}>{node}</div>}
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: {
            padding: 0,
            margin: 0,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            background: 'transparent',
          },
          body: {
            padding: 0,
            margin: 0,
          },
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)',
            color: '#fff',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 600,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          Select branch
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: '#fff',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#333', marginBottom: '12px' }}>
            Please select branch to order
          </div>

          {loading ? (
            <Spin style={{ display: 'block', textAlign: 'center', padding: '20px' }} />
          ) : error ? (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px', borderRadius: 8 }}
            />
          ) : (
            <List
              dataSource={branches}
              renderItem={(branch) => (
                <List.Item
                  onClick={() => handleBranchSelect(branch)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 8,
                    transition: 'background-color 0.2s, transform 0.1s',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  role="option"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleBranchSelect(branch)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{branch.Name}</span>
                    <span style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                      {branch.Address}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </Header>
  );
};

export default Navbar;
