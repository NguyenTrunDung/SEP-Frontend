import React, { useState, useEffect } from 'react';
import { Layout, Input, Row, Col, Modal, List, Spin, Alert, Button, Typography, message, Select, Checkbox, ConfigProvider, Avatar, Dropdown, Menu } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranches } from '../hooks/queries/useBranches';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { v4 as uuidv4 } from 'uuid';
import locale from 'antd/locale/vi_VN';
import ProfilePopup from '../components/Nurse/ViewProfilebyNurse';

const { Header } = Layout;
const { Text } = Typography;
const { Option } = Select;

const Navbar = () => {
  const { branches, loading, error } = useBranches();
  const { cartItems, setCartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    return savedBranch ? JSON.parse(savedBranch) : null;
  });
  const [hasCheckedBranch, setHasCheckedBranch] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [cartId, setCartId] = useState(null);
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
    console.log('Navbar - Current path:', location.pathname);
    if (!selectedBranch && !hasCheckedBranch) {
      setIsModalVisible(true);
      setHasCheckedBranch(true);
    }
  }, [selectedBranch, hasCheckedBranch, location.pathname]);

  useEffect(() => {
    console.log('Navbar - User data:', { user, role: user?.role });
  }, [user]);

  const showModal = () => setIsModalVisible(true);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranch', JSON.stringify(branch));
    setIsModalVisible(false);
  };

  const handleCartClick = () => {
    console.log('Opening cart modal with cartItems:', cartItems);
    setIsCartModalVisible(true);
    setIsEditModalVisible(false);
  };

  const handleCartUpdate = () => {
    console.log('Cart updated, new cartItems:', cartItems);
  };

  const handleGoToCart = () => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng của bạn đang trống.');
      return;
    }
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0;
    setPaymentDetails({
      ...paymentDetails,
      total,
      shippingFee,
      orderDetails: cartItems.map((item) => `${item.dishName} x${item.quantity}`).join('\n'),
    });
    setIsCartModalVisible(false);
    setIsPaymentModalVisible(true);
  };

  const handleRemoveCartItem = (cartId) => {
    const updatedItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedItems);
    console.log('Removed item, new cartItems:', updatedItems);
    message.success('Đã xóa món khỏi giỏ hàng.');
  };

  const handleEditCartItem = (cartId) => {
    const itemToEdit = cartItems.find((item) => item.cartId === cartId);
    if (itemToEdit) {
      setSelectedMenuItem({
        ID: itemToEdit.FoodId,
        dishName: itemToEdit.dishName,
        price: itemToEdit.price,
        image: itemToEdit.image,
        description: itemToEdit.description || 'Không có mô tả',
      });
      setQuantity(itemToEdit.quantity);
      setNote(itemToEdit.note || '');
      setCartId(itemToEdit.cartId);
      setIsCartModalVisible(false);
      setIsEditModalVisible(true);
    } else {
      message.error('Không tìm thấy món ăn trong giỏ hàng.');
    }
  };

  const handleUpdateCart = () => {
    if (!selectedMenuItem) return;

    if (cartId) {
      const updatedItems = cartItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity, note } : item
      );
      setCartItems(updatedItems);
      message.success(`${selectedMenuItem.dishName} đã được cập nhật trong giỏ hàng!`);
    } else {
      const newItem = {
        ...selectedMenuItem,
        quantity,
        cartId: uuidv4(),
        FoodId: selectedMenuItem.ID,
        note,
        BranchId: selectedBranch?.ID,
      };
      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      message.success(`${selectedMenuItem.dishName} đã được thêm vào giỏ hàng!`);
    }
    setIsEditModalVisible(false);
    setIsCartModalVisible(true);
    setSelectedMenuItem(null);
    setQuantity(1);
    setNote('');
    setCartId(null);
    handleCartUpdate();
  };

  const handlePaymentSubmit = () => {
    if (!paymentDetails.deliveryAddress || !paymentDetails.phoneNumber) {
      message.error('Vui lòng điền đầy đủ địa chỉ giao hàng và số điện thoại.');
      return;
    }
    message.success('Đặt món thành công!');
    setIsPaymentModalVisible(false);
    setCartItems([]);
    setPaymentDetails({
      ...paymentDetails,
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
    handleCartUpdate();
  };

  const handleMenuClick = (key) => {
    setActiveKey(key);
    if (key === 'cart') {
      handleCartClick();
    } else if (key === 'contact') {
      navigate('/contact');
    } else if (key === 'staff' && user?.role === ROLES.NURSE) {
      navigate('/nurse/home');
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
      console.error('User or user.role is undefined, redirecting to login');
      message.error('Không thể truy cập hồ sơ. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }
    setIsProfilePopupVisible(true);
  };

  const handleLogout = () => {
    console.log('Logging out user:', user);
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={handleProfileClick}
        style={{ fontSize: '15px' }}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ color: '#ff4d4f' }}
      >
        <span style={{ fontSize: '15px' }}>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

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
                {selectedBranch ? `Chi nhánh: ${selectedBranch.Name}` : 'Chọn chi nhánh'}
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
            {[
              { key: 'home', label: 'TRANG CHỦ', route: '/' },
              { key: 'menu', label: 'THỰC ĐƠN' },
              { key: 'cart', label: 'GIỎ HÀNG' },
              { key: 'staff', label: user?.role === ROLES.NURSE ? 'BỆNH NHÂN' : 'NHÂN VIÊN', route: user?.role === ROLES.NURSE ? '/nurse/home' : '/staff' },
              { key: 'contact', label: 'LIÊN HỆ', route: '/contact' },
            ].map(({ key, label, route }) => (
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
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
                <Text style={{ fontSize: '15px', color: '#666' }}>
                  Xin chào, <strong style={{ color: '#262626' }}>{user?.name || user?.email || 'N/A'}</strong>
                </Text>
                <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                  <Avatar
                    size="default"
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: '#1890ff',
                      cursor: 'pointer',
                    }}
                  />
                </Dropdown>
              </div>
            )}
          </Col>
        </Row>

        <Modal
          open={isModalVisible}
          footer={null}
          centered
          closable={false}
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
            ) : error ? (
              <Alert
                message={error}
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
                        {branch.Name}
                      </span>
                      <span style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {branch.Address}
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Modal>

        <Modal
          key={cartItems.length}
          open={isCartModalVisible}
          title={
            <div style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              textAlign: 'left',
              padding: '10px',
              borderRadius: '4px 4px 0 0'
            }}>
              Giỏ hàng
            </div>
          }
          onCancel={() => {
            setIsCartModalVisible(false);
            setSelectedMenuItem(null);
            setQuantity(1);
            setNote('');
            setCartId(null);
          }}
          footer={
            cartItems.length === 0
              ? null
              : [
                <div
                  key="footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '10px 0',
                  }}
                >
                  <Button
                    key="menu"
                    onClick={() => {
                      setIsCartModalVisible(false);
                      navigate('/menu');
                    }}
                    style={{
                      backgroundColor: '#b4c80f',
                      color: '#000',
                      border: 'none',
                      padding: '15px 100px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '400',
                    }}
                  >
                    Thêm Món
                  </Button>,
                  <Button
                    key="checkout"
                    type="primary"
                    onClick={handleGoToCart}
                    style={{
                      backgroundColor: '#b4c80f',
                      color: '#000',
                      border: 'none',
                      padding: '15px 80px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '400',
                    }}
                  >
                    Tiến Hành Đặt Món
                  </Button>
                </div>,
              ]
          }
          width="min(100vw, 600px)"
          centered
          style={{ padding: 0, margin: 0 }}
          modalRender={(node) => <div style={{ margin: 0, padding: 0 }}>{node}</div>}
          styles={{
            mask: { background: 'rgba(0, 0, 0, 0.6)' },
            content: { padding: 0, margin: 0, borderRadius: 5 },
            body: { padding: '16px', background: '#fff' },
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100px',
              }}
            >
              <Text style={{ fontSize: '16px', color: '#666' }}>
                Giỏ hàng của bạn đang trống.
              </Text>
            </div>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                    borderBottom: '1px solid #ddd',
                    paddingBottom: 8,
                  }}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                    alt={item.dishName}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 4,
                      marginRight: 16,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Text strong>{item.dishName}</Text>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveCartItem(item.cartId)}
                          style={{
                            backgroundColor: 'red',
                            borderColor: 'red',
                            color: '#fff',
                            borderRadius: '100%',
                            width: '26px',
                            height: '26px',
                            marginRight: '8px',
                          }}
                        />
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditCartItem(item.cartId)}
                          style={{
                            backgroundColor: '#b4c80f',
                            borderColor: '#b4c80f',
                            color: '#000',
                            borderRadius: '100%',
                            width: '26px',
                            height: '26px',
                            marginRight: '8px',
                          }}
                        />
                      </div>
                    </div>
                    {item.note && (
                      <Text style={{
                        color: '#999',
                        fontStyle: 'italic',
                        display: 'block',
                        marginTop: 4,
                      }}>
                        Ghi chú: {item.note}
                      </Text>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                    }}>
                      <Text>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          style={{
                            backgroundColor: '#b4c80f',
                            borderColor: '#b4c80f',
                            color: '#000',
                            borderRadius: '100%',
                            width: '26px',
                            height: '26px',
                            marginRight: '8px',
                          }}
                          onClick={() => {
                            const updatedItems = cartItems.map((cartItem) =>
                              cartItem.cartId === item.cartId
                                ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
                                : cartItem
                            );
                            setCartItems(updatedItems);
                            message.success(`${item.dishName} đã được cập nhật số lượng.`);
                          }}
                        >
                          -
                        </Button>
                        <span style={{ fontSize: '16px', margin: '0 8px' }}>{item.quantity}</span>
                        <Button
                          style={{
                            backgroundColor: '#b4c80f',
                            borderColor: '#b4c80f',
                            color: '#000',
                            borderRadius: '100%',
                            width: '26px',
                            height: '26px',
                            marginLeft: '8px',
                          }}
                          onClick={() => {
                            const updatedItems = cartItems.map((cartItem) =>
                              cartItem.cartId === item.cartId
                                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                : cartItem
                            );
                            setCartItems(updatedItems);
                            message.success(`${item.dishName} đã được cập nhật số lượng.`);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
              }}>
                <Text strong style={{ color: 'black' }}>Tạm tính:</Text>
                <Text style={{ color: 'red' }}>
                  {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')} đ
                </Text>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setIsCartModalVisible(true);
            setSelectedMenuItem(null);
            setQuantity(1);
            setNote('');
            setCartId(null);
          }}
          footer={null}
          width={600}
          centered
          closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
          styles={{
            content: {
              padding: 0,
              background: '#fff',
              borderRadius: '8px',
            },
            body: {
              padding: 0,
            },
          }}
        >
          <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#b4c80f',
                color: '#000',
                padding: '12px 16px',
                fontSize: '18px',
              }}
            >
              Cập nhật giỏ hàng
            </div>
            <img
              src={selectedMenuItem?.image || 'https://via.placeholder.com/600x250?text=No+Image'}
              alt={selectedMenuItem?.dishName}
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '16px' }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px',
                }}
              >
                {selectedMenuItem?.dishName || 'Không có tên'}
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: '15px',
                  color: '#555',
                  marginBottom: '8px',
                }}
              >
                {selectedMenuItem?.description || 'Không có mô tả'}
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#ff0000',
                  marginBottom: '8px',
                }}
              >
                {selectedMenuItem?.price?.toLocaleString('vi-VN') || '0'} đ
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px',
                }}
              >
                Ghi chú:
              </Text>
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú..."
                style={{
                  marginBottom: '20px',
                  height: '115px',
                  resize: 'none',
                }}
              />
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Button
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span style={{ margin: '0 16px', fontSize: '16px' }}>{quantity}</span>
                <Button
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                style={{
                  backgroundColor: '#b4c80f',
                  borderColor: '#b4c80f',
                  color: '#000',
                  width: '100%',
                  padding: '18px',
                  fontSize: '16px',
                  borderRadius: '6px',
                }}
                onClick={handleUpdateCart}
              >
                Cập Nhật Giỏ Hàng
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={isPaymentModalVisible}
          onCancel={() => {
            setIsPaymentModalVisible(false);
            setIsCartModalVisible(true);
          }}
          footer={null}
          width={600}
          centered
          closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
          styles={{
            content: {
              padding: 0,
              background: '#fff',
              borderRadius: '8px',
            },
            body: {
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100vh',
            },
          }}
        >
          <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                backgroundColor: '#b4c80f',
                color: '#000',
                padding: '12px 16px',
                fontSize: '18px',
                textAlign: 'left',
              }}
            >
              Thanh toán
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Text strong style={{ fontSize: '16px' }}>Thông tin đặt hàng</Text>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Chi nhánh
                </Text>
                <Select
                  value={selectedBranch?.Name}
                  disabled
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value={selectedBranch?.Name}>{selectedBranch?.Name}</Option>
                </Select>
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Họ và tên
                </Text>
                <Input
                  value={paymentDetails.fullName}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Số điện thoại
                </Text>
                <Input
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Địa chỉ giao hàng
                </Text>
                <Input
                  value={paymentDetails.deliveryAddress}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, deliveryAddress: e.target.value })}
                  placeholder="Nhập địa chỉ giao hàng"
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Hình thức nhận hàng
                </Text>
                <Select
                  value={paymentDetails.receiveMethod}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, receiveMethod: value, shippingFee: value === 'Giao tận nơi' ? 5000 : 0 })}
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value="Giao tận nơi">Giao tận nơi</Option>
                  <Option value="Nhận tại quầy">Nhận tại quầy</Option>
                </Select>
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Khu</Text>
                <Select
                  value={paymentDetails.area}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, area: value })}
                  placeholder="Chọn khu"
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value="Khoa Nội">Khoa Nội</Option>
                  <Option value="Khu hành chính">Khu hành chính</Option>
                </Select>
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phòng</Text>
                <Select
                  value={paymentDetails.room}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, room: value })}
                  placeholder="Chọn phòng"
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value="Phòng hành chính">Phòng hành chính</Option>
                  <Option value="Phòng B24">Phòng B24</Option>
                </Select>
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Hẹn thời gian giao hàng
                </Text>
                <Select
                  value={paymentDetails.deliveryTime}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, deliveryTime: value })}
                  placeholder="Chọn thời gian giao hàng"
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value="30 phút">30 phút</Option>
                  <Option value="45 phút">45 phút</Option>
                  <Option value="60 phút">60 phút</Option>
                  <Option value="Tuỳ chọn thời gian">Tuỳ chọn thời gian</Option>
                </Select>
              </div>
              <div>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Ghi chú</Text>
                <Input.TextArea
                  placeholder="Ghi chú thêm"
                  value={paymentDetails.note}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, note: e.target.value })}
                  style={{ height: '115px', resize: 'none', borderRadius: '4px' }}
                />
              </div>
              <Checkbox
                checked={paymentDetails.includeUtensils}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, includeUtensils: e.target.checked })}
              >
                Lấy dụng cụ ăn
              </Checkbox>
              <div style={{ marginTop: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Phương thức thanh toán
                </Text>
                <Select
                  value={paymentDetails.paymentMethod}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, paymentMethod: value })}
                  placeholder="Chọn phương thức thanh toán"
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <Option value="Tiền mặt">Tiền mặt</Option>
                  <Option value="Thẻ ngân hàng">Thẻ ngân hàng</Option>
                  <Option value="Chuyển khoản">Chuyển khoản</Option>
                </Select>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Chi tiết đơn hàng</div>
                {cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      gap: '12px',
                    }}
                  >
                    <img
                      src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                      alt={item.dishName}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.dishName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ color: '#000' }}>
                          {(item.price).toLocaleString('vi-VN')}đ
                        </div>
                        <div style={{ color: '#888' }}>
                          x{item.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '500', color: '#ff0000' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>Tạm tính</Text>
                <Text style={{ fontSize: '16px', color: '#000' }}>
                  {paymentDetails.total.toLocaleString('vi-VN')}đ
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>Phí vận chuyển</Text>
                <Text style={{ fontSize: '16px', color: '#000' }}>
                  {paymentDetails.shippingFee.toLocaleString('vi-VN')}đ
                </Text>
              </div>
              {paymentDetails.includeUtensils && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '16px' }}>Phí dụng cụ ăn</Text>
                  <Text style={{ fontSize: '16px', color: '#000' }}>5.000đ</Text>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>Tổng cộng</Text>
                <Text style={{ fontSize: '16px', color: '#ff0000' }}>
                  {(paymentDetails.total + paymentDetails.shippingFee + (paymentDetails.includeUtensils ? 5000 : 0)).toLocaleString('vi-VN')}đ
                </Text>
              </div>
              <Button
                style={{
                  backgroundColor: '#b4c80f',
                  borderColor: '#b4c80f',
                  color: '#000',
                  padding: '18px',
                  fontSize: '16px',
                  width: '100%',
                  borderRadius: '6px',
                }}
                onClick={handlePaymentSubmit}
              >
                Đặt Món
              </Button>
            </div>
          </div>
        </Modal>

        <ProfilePopup
          visible={isProfilePopupVisible}
          onClose={() => setIsProfilePopupVisible(false)}
        />
      </Header>
    </ConfigProvider>
  );
};

export default Navbar;