// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Layout, Input, Row, Col, Modal, List, Spin, Alert, Button, Typography, message, ConfigProvider, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined, EditOutlined, WalletOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranches, useSwitchBranch } from '../hooks/queries/userBranchesQueries';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import locale from 'antd/locale/vi_VN';
import ProfilePopup from '../components/Nurse/ViewProfilebyNurse';
import CartModal from '../components/Cart/Cart';
import PaymentModal from '../components/Payment/Payment';
import OrderHistoryModal from '../components/OrderHistory/OrderHistory';
import WalletModal from '../components/Wallet/Wallet';
import UserHeader from '../components/common/UserHeader';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { data: branchesData, isLoading: loading, isError, error } = useBranches();
  const switchBranchMutation = useSwitchBranch();
  const { cartItems, setCartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    return savedBranch ? JSON.parse(savedBranch) : null;
  });

  const branches = Array.isArray(branchesData) ? branchesData : [];
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [isOrderHistoryVisible, setIsOrderHistoryVisible] = useState(false);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    deliveryAddress: '',
    fullName: '',
    phoneNumber: '',
    paymentMethod: '',
    area: '',
    room: '',
    deliveryTime: '',
    note: '',
    receiveMethod: 'Giao tận nơi',
    includeUtensils: false,
    showPaymentMethod: false,
    total: 0,
    shippingFee: 5000,
    orderDetails: '',
  });
  const [activeKey, setActiveKey] = useState('home');

  useEffect(() => {
    if (!selectedBranch) {
      setIsModalVisible(true);
    }
  }, [selectedBranch]);

  useEffect(() => {
    console.log('Navbar - User data:', { user, role: user?.role, location: location.pathname });
  }, [user, location]);

  const showModal = () => setIsModalVisible(true);

  const handleBranchSelect = async (branch) => {
  try {
    await switchBranchMutation.mutateAsync(branch.id);
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranch', JSON.stringify(branch));
    localStorage.setItem('currentBranchId', branch.id); // Sync with multiTenant
    setIsModalVisible(false);
    message.success(`Đã chuyển sang chi nhánh: ${branch.name}`);
  } catch (error) {
    console.error('Failed to switch branch:', error);
    message.error('Không thể chuyển chi nhánh. Vui lòng thử lại.');
  }
};

  const handleCartClick = () => {
    console.log('Opening cart modal with cartItems:', cartItems);
    setIsCartModalVisible(true);
  };

  const handleCartUpdate = () => {
    console.log('Cart updated, new cartItems:', cartItems);
  };

  const handleMenuClick = (key) => {
    console.log('Menu clicked:', { key, userRole: user?.role });
    setActiveKey(key);
    const menuItem = menuItems.find((item) => item.key === key);
    if (menuItem?.route) {
      console.log(`Navigating to: ${menuItem.route}`);
      navigate(menuItem.route);
    } else if (key === 'cart') {
      console.log('Handling cart click');
      handleCartClick();
    } else {
      console.log(`Checking for section with ID: ${key}`);
      const section = document.getElementById(key);
      if (section) {
        const headerHeight = 139;
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: sectionPosition - headerHeight,
          behavior: 'smooth',
        });
      } else {
        console.warn(`No route or section found for key: ${key}`);
        message.error('Không tìm thấy trang hoặc mục tương ứng.');
      }
    }
  };

  const handleProfileClick = () => {
    if (!user || !user.role) {
      console.error('User or user.role is undefined, redirecting to login');
      message.error('Không thể truy cập hồ sơ. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }
    console.log('Opening profile popup for user:', user);
    setIsProfilePopupVisible(true);
    setIsUserMenuVisible(false);
  };

  const handleLogout = () => {
    console.log('Logging out user:', user);
    logout();
    navigate('/login');
    setIsUserMenuVisible(false);
  };

  const handleOrderHistoryClick = () => {
    console.log('Opening order history');
    setIsOrderHistoryVisible(true);
    setIsUserMenuVisible(false);
  };

  const handleWalletClick = () => {
    console.log('Opening wallet modal');
    setIsWalletModalVisible(true);
    setIsUserMenuVisible(false);
  };

  const menuItems = [
    { key: 'home', label: 'TRANG CHỦ', route: '/' },
    { key: 'menu', label: 'THỰC ĐƠN' },
    { key: 'cart', label: 'GIỎ HÀNG' },
    ...(user?.role === ROLES.NURSE
      ? [
          { key: 'staff', label: 'BỆNH NHÂN', route: '/nurse/patient' },
        ]
      : user?.role === ROLES.GUEST
        ? []
        : []
    ),
    { key: 'contact', label: 'LIÊN HỆ', route: '/contact' },
  ];

  console.log('Menu items:', menuItems);

  return (
    <ConfigProvider locale={locale}>
      <Header
        style={{
          backgroundColor: '#fff',
          padding: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          fontFamily: 'Quicksand, sans-serif',
        }}
      >
        <div style={{ backgroundColor: '#b4c80f', padding: '8px 20px', height: '40px', lineHeight: '26px' }}>
          <Row align="middle" justify="space-between">
            <Col>
              {/* Reserved for future use */}
            </Col>
            <Col>
              <Row align="middle" gutter={16}>
                <Col>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                    Hotline: 028 3840 8379
                  </span>
                </Col>
                <Col>
                  <span style={{ color: '#fff', fontSize: '14px' }}>|</span>
                </Col>
                <Col>
                  <span
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <SearchOutlined style={{ marginRight: '4px' }} />
                    Tra Cứu Đơn Hàng
                  </span>
                </Col>
                <Col>
                  <span style={{ color: '#fff', fontSize: '14px' }}>|</span>
                </Col>
                <Col>
                  <span
                    onClick={showModal}
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '4px 12px',
                      border: '1px solid #fff',
                      borderRadius: '8px',
                    }}
                  >
                    {selectedBranch ? `Chi nhánh: ${selectedBranch.name}` : 'Chọn chi nhánh'}
                  </span>
                </Col>
                <Col>
                  <span style={{ color: '#fff', fontSize: '14px' }}>|</span>
                </Col>
                <Col>
                  <UserHeader
                    showGreeting={true}
                    avatarSize="small"
                    guestButtonStyle="link"
                    useCustomModal={true}
                    onAvatarClick={() => setIsUserMenuVisible(true)}
                    style={{
                      gap: '8px',
                    }}
                    greetingStyle={{ color: '#fff', fontSize: '14px' }}
                    onLogout={() => {
                      handleLogout();
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <Row align="middle" style={{ backgroundColor: '#fff', padding: '0 20px', height: '99px' }}>
          <Col xs={12} sm={6} md={4}>
            <img
              src="/images/lg.png"
              alt="Logo"
              style={{ height: 'clamp(50px, 10vw, 80px)', maxHeight: '76px', objectFit: 'contain' }}
            />
          </Col>
          <Col xs={12} sm={18} md={20} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {menuItems.map(({ key, label, route }) => (
              <Button
                key={key}
                type={activeKey === key ? 'primary' : 'default'}
                onClick={() => handleMenuClick(key)}
                style={{
                  margin: '0 4px',
                  backgroundColor: activeKey === key ? '#b4c80f' : '#fff',
                  color: activeKey === key ? '#000' : '#000',
                  border: `1px solid ${activeKey === key ? '#b4c80f' : '#fff'}`,
                  borderRadius: '2px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  position: 'relative',
                }}
              >
                {label}
                {key === 'cart' && cartItems.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      backgroundColor: '#ff0000',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Button>
            ))}
          </Col>
        </Row>

        <Modal
          open={isModalVisible}
          footer={null}
          centered
          closable={true}
          onCancel={() => setIsModalVisible(false)}
          width="min(100vw, 600px)"
          style={{ padding: 0, margin: 0, top: 0 }}
          modalRender={(node) => <div style={{ margin: 0, padding: 0 }}>{node}</div>}
          styles={{
            mask: { background: 'rgba(0, 0, 0, 0.6)' },
            content: { padding: 0, margin: 0, borderRadius: 5 },
            body: { padding: 0, margin: 0 },
          }}
        >
          <div
            style={{
              background: '#b4c80f',
              color: '#000',
              padding: '16px 20px',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            Chọn chi nhánh
          </div>
          <div
            style={{
              padding: '20px 20px',
              background: '#fff',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontWeight: 500, fontSize: '16px', color: '#333', marginBottom: '12px' }}>
              Quý khách vui lòng chọn chi nhánh đặt hàng
            </div>
            {loading ? (
              <Spin style={{ display: 'block', textAlign: 'center', padding: '20px' }} />
            ) : isError ? (
              <Alert
                message={error?.message || 'Không thể tải danh sách chi nhánh'}
                type="error"
                showIcon
                style={{ marginBottom: '16px', borderRadius: 0 }}
              />
            ) : (
              <List
                dataSource={branches}
                renderItem={(branch) => (
                  <List.Item
                    onClick={() => handleBranchSelect(branch)}
                    style={{
                      cursor: 'pointer',
                      padding: '16px 20px',
                      borderRadius: 0,
                      marginBottom: 8,
                      background: '#fff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                    role="option"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleBranchSelect(branch)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 480, color: '#1a1a1a', fontSize: '18px' }}>
                        {branch.name}
                      </span>
                      <span style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {branch.address}
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Modal>

        <CartModal
          isCartModalVisible={isCartModalVisible}
          setIsCartModalVisible={setIsCartModalVisible}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setIsPaymentModalVisible={setIsPaymentModalVisible}
          paymentDetails={paymentDetails}
          setPaymentDetails={setPaymentDetails}
          selectedBranch={selectedBranch}
          handleCartUpdate={handleCartUpdate}
        />

        <PaymentModal
          isPaymentModalVisible={isPaymentModalVisible}
          setIsPaymentModalVisible={setIsPaymentModalVisible}
          setIsCartModalVisible={setIsCartModalVisible}
          cartItems={cartItems}
          setCartItems={setCartItems}
          paymentDetails={paymentDetails}
          setPaymentDetails={setPaymentDetails}
          selectedBranch={selectedBranch}
          handleCartUpdate={handleCartUpdate}
        />

        <Modal
          open={isUserMenuVisible}
          onCancel={() => setIsUserMenuVisible(false)}
          footer={null}
          centered
          width={500}
          closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
          styles={{
            content: { padding: 0, borderRadius: 8 },
            body: { padding: 0 },
            header: { display: 'none' },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#b4c80f',
                color: '#000',
                padding: '16px 20px',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              Nhân viên
            </div>
            <div style={{ padding: '16px', background: '#fff' }}>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Text style={{ fontSize: '15px', color: '#666' }}>
                    Xin chào, <strong style={{ color: '#262626' }}>{user?.name || user?.email || 'N/A'}</strong>
                  </Text>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Button
                  icon={<WalletOutlined />}
                  onClick={handleWalletClick}
                  style={{
                    textAlign: 'center',
                    fontSize: '15px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                  }}
                >
                  Ví của bạn
                </Button>
                <Button
                  icon={<ShoppingOutlined />}
                  onClick={handleOrderHistoryClick}
                  style={{
                    textAlign: 'left',
                    fontSize: '15px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                  }}
                >
                  Đơn hàng đã đặt
                </Button>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => {
                    handleProfileClick();
                    setIsUserMenuVisible(false);
                  }}
                  style={{
                    textAlign: 'left',
                    fontSize: '15px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                  }}
                >
                  Thông tin hồ sơ
                </Button>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    handleLogout();
                    setIsUserMenuVisible(false);
                  }}
                  style={{
                    textAlign: 'left',
                    fontSize: '15px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    color: '#ff4d4f',
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <ProfilePopup
          visible={isProfilePopupVisible}
          onClose={() => setIsProfilePopupVisible(false)}
        />

        <OrderHistoryModal
          visible={isOrderHistoryVisible}
          onClose={() => setIsOrderHistoryVisible(false)}
        />

        <WalletModal
          visible={isWalletModalVisible}
          onClose={() => setIsWalletModalVisible(false)}
        />
      </Header>
    </ConfigProvider>
  );
};

export default Navbar;