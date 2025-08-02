import React, { useState, useEffect } from 'react';
import { Layout, Input, Row, Col, Modal, List, Spin, Alert, Button, Typography, message, ConfigProvider, Avatar, Card, Image } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined, EditOutlined, WalletOutlined, ShoppingOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePublicBranchesOnly, usePublicSwitchBranchOnly } from '../../hooks/queries/useBranchSelector';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import locale from 'antd/locale/vi_VN';
import ProfilePopup from '../Nurse/ViewProfilebyNurse';
import CartModal from '../Cart/Cart';
import PaymentModal from '../Payment/Payment';
import OrderHistoryModal from '../OrderHistory/OrderHistory';
import WalletModal from '../Wallet/Wallet';
import UserHeader from '../common/UserHeader';
import OrderTrackingPopup from '../Order/OrderTrackingPopup';
import { AuthFormPublic } from '../common/AuthForm';
import { queryClient } from '../../lib/reactQuery';


const { Header } = Layout;
const { Text, Title } = Typography;

const Navbar = () => {
  const { data: branchesData, isLoading: loading, isError, error } = usePublicBranchesOnly();
  const switchBranchMutation = usePublicSwitchBranchOnly();
  const { cartItems, setCartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    return savedBranch ? JSON.parse(savedBranch) : null;
  });
  const [isOrderTrackingVisible, setIsOrderTrackingVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const branches = branchesData && Array.isArray(branchesData) ? branchesData : [];
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

  // Add event listener to clear localStorage on tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('selectedBranch');
      localStorage.removeItem('currentBranchId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const excludeRoutes = ['/login', '/register', '/contact'];
    const params = new URLSearchParams(location.search);
    const branchId = params.get('branch');

    // Xử lý chi nhánh từ query parameter
    if (branchId && branches.length > 0 && !selectedBranch) {
      const branch = branches.find(b => b.id === parseInt(branchId));
      if (branch) {
        console.log('Selecting branch from URL:', branch);
        handleBranchSelect(branch);
        return;
      } else {
        console.warn('Invalid branch ID in URL:', branchId);
      }
    }

    // Hiển thị modal nếu chưa có chi nhánh được chọn và không ở các tuyến đường loại trừ
    if (!selectedBranch && !excludeRoutes.includes(location.pathname) && (!user || user?.role !== ROLES.NURSE)) {
      console.log('Showing branch selection popup: no branch selected');
      setIsModalVisible(true);
    } else {
      console.log('Not showing branch selection popup:', {
        hasSelectedBranch: !!selectedBranch,
        isExcludedRoute: excludeRoutes.includes(location.pathname),
        isNurse: user?.role === ROLES.NURSE,
      });
      setIsModalVisible(false);
    }
  }, [location.pathname, location.search, branches, selectedBranch, user]);

  useEffect(() => {
    console.log('Navbar - User data:', { user, role: user?.role, location: location.pathname });
  }, [user, location]);

  const handleBranchSelect = async (branch) => {
    try {
      console.log('🔄 Switching to branch:', branch);

      // Call the mutation to switch branch
      await switchBranchMutation.mutateAsync(branch.id);

      // Update local state
      setSelectedBranch(branch);
      localStorage.setItem('selectedBranch', JSON.stringify(branch));
      localStorage.setItem('currentBranchId', branch.id);

      // Close modal
      setIsModalVisible(false);

      // Show success message
      message.success(`Đã chuyển sang chi nhánh: ${branch.name}`);

      // Force refetch of menu data by invalidating all menu queries
      // This will trigger a refetch of menu data with the new branch context
      if (queryClient) {
        // Invalidate all menu-related queries to force refresh
        queryClient.invalidateQueries({ queryKey: ['menus'] });
        queryClient.invalidateQueries({ queryKey: ['public', 'menus'] });

        // Force refetch current menu data
        queryClient.refetchQueries({ queryKey: ['menus', 'byDate'] });

        console.log('🔄 Invalidated menu queries for branch switch');
      }

    } catch (error) {
      console.error('❌ Failed to switch branch:', error);
      message.error('Không thể chuyển chi nhánh. Vui lòng thử lại.');
    }
  };

  const handleOpenBranchModal = () => {
    if (!user) {
      setIsModalVisible(true);
    } else {
      message.info('Bạn không thể thay đổi chi nhánh khi đã đăng nhập.');
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
    navigate('/');
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

  const handleLoginClick = () => {
    console.log('open modal login for user');
    setIsLoginModalVisible(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalVisible(false);
    message.success('Đăng nhập thành công!');
    // Redirect về trang chủ sau khi login thành công
    // Nếu user là NURSE, redirect về /nurse/home
    const redirectPath = user?.role === 'NURSE' ? '/nurse/home' : '/';
    navigate(redirectPath, { replace: true });
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
                    onClick={() => setIsOrderTrackingVisible(true)}
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
                    onClick={!user ? handleOpenBranchModal : undefined}
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      padding: '4px 12px',
                      border: '1px solid #fff',
                      borderRadius: '8px',
                      cursor: user ? 'not-allowed' : 'pointer',
                      opacity: user ? 0.6 : 1,
                    }}
                  >
                    {selectedBranch ? `Chi nhánh: ${selectedBranch.name}` : 'Chọn chi nhánh'}
                  </span>
                </Col>
                <Col>
                  <span style={{ color: '#fff', fontSize: '14px' }}>|</span>
                </Col>
                <Col>
                  {user ? (
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
                        logout();
                        navigate('/');
                      }}
                    />
                  ) : (
                    <Row gutter={8} align="middle">
                      <Col>
                        <Button
                          type="text"
                          onClick={handleLoginClick}
                          style={{
                            color: '#fff',
                            borderColor: '#fff',
                            backgroundColor: 'transparent',
                            fontSize: 13,
                            height: 28,
                            padding: '0 10px',
                            borderRadius: 16,
                            fontWeight: 500,
                            lineHeight: '26px',
                          }}
                        >
                          Đăng nhập
                        </Button>
                      </Col>
                    </Row>
                  )}
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
          closable={selectedBranch !== null}
          maskClosable={selectedBranch !== null}
          centered
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
            Chọn bệnh viện
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
              Quý khách vui lòng chọn bệnh viện đặt hàng
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
            ) : branches.length > 0 ? (
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
                    onKeyDown={(e) => e.key === 'Enter' && handleBranchSelect(branch)}
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
            ) : (
              <Alert
                message="Không có chi nhánh nào để hiển thị"
                type="info"
                showIcon
                style={{ marginBottom: '16px', borderRadius: 0 }}
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

        <OrderTrackingPopup
          visible={isOrderTrackingVisible}
          onClose={() => setIsOrderTrackingVisible(false)}
        />

        <Modal
          open={isLoginModalVisible}
          onCancel={() => setIsLoginModalVisible(false)}
          footer={null}
          centered
          width={500}
          destroyOnClose

          closeIcon={<CloseOutlined style={{ color: '#000', fontSize: '20px' }} />}
          styles={{
            content: { padding: 0, borderRadius: 8, overflow: 'hidden' },
            body: { padding: 0 },
          }}
        >
          <Card variant="outlined" style={{ borderRadius: 8 }}>
            <div style={{ padding: '40px 32px' }}>
              <div style={{
                textAlign: 'center'
              }}>
                <Image
                  src="/images/lg.png"
                  alt="Dussmann Logo"
                  preview={false}
                  width={120}
                  style={{}}
                />
                <Title level={3} style={{ margin: '16px 0 8px' }}>
                  Welcome to Hệ thống đặt suất ăn bệnh viện!
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '4px', fontSize: '16px' }}>
                  Vui lòng đăng nhập để tiếp tục
                </Text>
              </div>

              <ConfigProvider
                theme={{
                  components: {
                    Input: {
                      activeBorderColor: '#b4c80f',
                      hoverBorderColor: '#b4c80f',
                      activeShadow: '0 0 0 2px rgba(180, 200, 15, 0.2)'
                    },
                    Checkbox: {
                      colorPrimary: '#b4c80f'
                    }
                  }
                }}
              >
                <AuthFormPublic
                  onSuccess={handleLoginSuccess}
                  redirectPath="/"
                  showTestAccounts={false}
                  submitText="Đăng Nhập"
                  customStyle={{
                    submitButton: {
                      backgroundColor: '#b4c80f',
                      borderColor: '#b4c80f',
                      color: '#000',
                      '&:hover': {
                        backgroundColor: '#a3b60e',
                        borderColor: '#a3b60e',
                        color: '#000'
                      }
                    }
                  }}
                />
              </ConfigProvider>
            </div>
          </Card>
        </Modal>
      </Header>
    </ConfigProvider>
  );
};

export default Navbar;