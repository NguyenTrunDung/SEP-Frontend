// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Button, Typography, message, ConfigProvider, Modal } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined, WalletOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import locale from 'antd/es/locale/vi_VN';
import ProfilePopup from '../components/Nurse/ViewProfilebyNurse';
import CartModal from '../components/Cart/Cart';
import PaymentModal from '../components/Payment/Payment';
import OrderHistoryModal from '../components/OrderHistory/OrderHistory';
import WalletModal from '../components/Wallet/Wallet';
import BranchSelector from '../components/Branch/BranchSelector';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { cartItems, setCartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    return savedBranch ? JSON.parse(savedBranch) : null;
  });
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    const isFreshLoad = sessionStorage.getItem('isInitialLoad') !== 'false';
    return isFreshLoad;
  });
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
    if (isInitialLoad && !user) {
      setIsModalVisible(true);
      sessionStorage.setItem('isInitialLoad', 'false');
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, user]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('isInitialLoad', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const showModal = () => setIsModalVisible(true);

  const handleBranchSelect = (branch) => {
    // Đảm bảo branch có cấu trúc đúng (name, id, address, etc.)
    const selectedBranchData = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    };
    setSelectedBranch(selectedBranchData);
    localStorage.setItem('selectedBranch', JSON.stringify(selectedBranchData));
    setIsModalVisible(false);
  };

  const handleCartClick = () => {
    setIsCartModalVisible(true);
  };

  const handleMenuClick = (key) => {
    setActiveKey(key);
    if (key === 'cart') {
      handleCartClick();
    } else if (key === 'contact') {
      navigate('/contact');
    } else if (key === 'staff' && user?.role === ROLES.NURSE) {
      navigate('/nurse/home');
    } else if (key === 'employee' && user?.role === ROLES.NURSE) {
      setIsUserMenuVisible(true);
    } else {
      const routes = {
        home: '/',
        staff: user?.role === ROLES.NURSE ? '/nurse/home' : '/staff',
      };
      const section = document.getElementById(key);
      if (section) {
        const headerHeight = 139;
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: sectionPosition - headerHeight,
          behavior: 'smooth',
        });
      } else if (routes[key]) {
        navigate(routes[key]);
      }
    }
  };

  const handleProfileClick = () => {
    if (!user || !user.role) {
      message.error('Không thể truy cập hồ sơ. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }
    setIsProfilePopupVisible(true);
    setIsUserMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuVisible(false);
  };

  const handleOrderHistoryClick = () => {
    setIsOrderHistoryVisible(true);
    setIsUserMenuVisible(false);
  };

  const handleWalletClick = () => {
    setIsWalletModalVisible(true);
    setIsUserMenuVisible(false);
  };

  const menuItems = [
    { key: 'home', label: 'TRANG CHỦ', route: '/' },
    { key: 'menu', label: 'THỰC ĐƠN' },
    { key: 'cart', label: 'GIỎ HÀNG' },
    ...(user?.role === ROLES.NURSE
      ? [
          { key: 'staff', label: 'BỆNH NHÂN', route: '/nurse/home' },
          { key: 'contact', label: 'LIÊN HỆ', route: '/contact' },
          { key: 'employee', icon: <UserOutlined />, label: 'NHÂN VIÊN' },
        ]
      : user?.role === ROLES.GUEST
      ? [{ key: 'contact', label: 'LIÊN HỆ', route: '/contact' }]
      : [
          { key: 'contact', label: 'LIÊN HỆ', route: '/contact' },
          { key: 'staff', icon: <UserOutlined />, label: 'NHÂN VIÊN', route: '/staff' },
        ]
    ),
  ];

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
          <Row align="middle" justify="end">
            <Col style={{ marginRight: '8px' }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                Hotline: 028 3840 8379
              </span>
            </Col>
            <Col style={{ marginRight: '8px' }}>
              <span style={{ color: '#fff', fontSize: '14px' }}>|</span>
            </Col>
            <Col style={{ marginRight: '16px' }}>
              <span
                style={{
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => navigate('/order-tracking')}
              >
                <SearchOutlined style={{ marginRight: '4px' }} />
                Tra Cứu Đơn Hàng
              </span>
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
                {selectedBranch ? `Chi nhánh: ${selectedBranch.name || 'N/A'}` : 'Chọn chi nhánh'} {/* Sử dụng selectedBranch.name */}
              </span>
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
            {menuItems.map(({ key, label, icon, route }) => (
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
                  display: 'flex',
                  alignItems: 'center',
                }}
                icon={key === 'employee' || (key === 'staff' && user?.role !== ROLES.NURSE) ? icon : null}
                aria-label={label}
              >
                {(key === 'employee' || (key === 'staff' && user?.role !== ROLES.NURSE)) ? null : label}
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

        <BranchSelector
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelect={handleBranchSelect}
          selectedBranch={selectedBranch}
        />

        <CartModal
          isCartModalVisible={isCartModalVisible}
          setIsCartModalVisible={setIsCartModalVisible}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setIsPaymentModalVisible={setIsPaymentModalVisible}
          paymentDetails={paymentDetails}
          setPaymentDetails={setPaymentDetails}
          selectedBranch={selectedBranch}
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
                  onClick={handleProfileClick}
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
                  onClick={handleLogout}
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