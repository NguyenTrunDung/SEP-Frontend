import React, { useState } from 'react';
import { Layout, Menu, Input, Row, Col, Modal, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        lineHeight: '40px',
      }}
    >
      <Row align="middle" justify="space-between" gutter={[8, 8]}>
        <Col xs={24} sm={16} md={18}>
          <Row align="middle" gutter={[8, 8]}>
            <Col xs={24} sm={12} md={6}>
              <span
                style={{
                  color: '#fff',
                  fontSize: 'clamp(12px, 2vw, 14px)',
                }}
              >
                Hotline: 028 3840 8379
              </span>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder="Tìm kiếm"
                prefix={<SearchOutlined />}
                size="middle"
                style={{
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '250px',
                  backgroundColor: '#fff',
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
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  border: '1px solid #fff',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && showModal()}
              >
                {selectedBranch ? `Chi nhánh: ${selectedBranch}` : 'Chọn chi nhánh'}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row align="middle" style={{ backgroundColor: '#fff', padding: '8px 16px' }}>
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
              fontSize: 'clamp(14px, 2vw, 16px)',
            }}
            items={[
              { key: 'home', label: 'Trang chủ' },
              { key: 'menu', label: 'Thực đơn' },
              { key: 'order', label: 'Đặt hàng' },
              { key: 'staff', label: 'Nhân viên' },
              { key: 'contact', label: 'Liên hệ' },
            ]}
            overflowedIndicator={<span style={{ fontSize: '16px' }}>☰</span>}
          />
        </Col>
      </Row>

      <Modal
        title="Chọn chi nhánh"
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