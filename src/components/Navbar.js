// Navbar.js
import React, { useState, useEffect } from 'react';
import { Layout, Input, Row, Col, Modal, List, Spin, Alert, Button, Typography, message } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Link as ScrollLink } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '../hooks/queries/useBranches';
import { useCart } from '../context/CartContext';
import MenuPage from '../components/Dishes/Menu';
import { v4 as uuidv4 } from 'uuid';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { branches, loading, error } = useBranches();
  const { cartItems, setCartItems } = useCart();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [cartId, setCartId] = useState(null);
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('home');

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

  const handleCartClick = () => {
    console.log('Opening cart modal with cartItems:', cartItems);
    setIsCartModalVisible(true);
    setIsEditModalVisible(false);
  };

  const handleCartUpdate = () => {
    console.log('Cart updated, new cartItems:', cartItems);
  };

  const handleGoToCart = () => {
    setIsCartModalVisible(false);
    navigate('/cart', { state: { cartItems } });
  };

  const handleRemoveCartItem = (cartId) => {
    const updatedItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedItems);
    console.log('Removed item, new cartItems:', updatedItems);
    message.success('Đã xóa món khỏi giỏ hàng.');
  };

  const handleMenuClick = (key) => {
    setActiveKey(key);
    if (key === 'cart') {
      handleCartClick();
    }
  };

  const handleEditCartItem = (cartId) => {
    const itemToEdit = cartItems.find((item) => item.cartId === cartId);
    if (itemToEdit) {
      setSelectedMenuItem({
        ID: itemToEdit.FoodId,
        dishName: itemToEdit.dishName,
        price: itemToEdit.price,
        image: itemToEdit.image,
        description: itemToEdit.description || 'No description available',
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
        item.cartId === cartId
          ? { ...item, quantity, note }
          : item
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
        BranchId: selectedBranch?.ID, // Thêm BranchId vào giỏ hàng
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

  return (
    <>
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
              src="/images/logo.png"
              alt="Logo"
              style={{ height: 'clamp(50px, 10vw, 80px)', maxHeight: '76px', objectFit: 'contain' }}
            />
          </Col>
          <Col xs={12} sm={18} md={20} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {['home', 'menu', 'cart', 'staff', 'contact'].map((key) => (
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
                }}
              >
                {key === 'home' ? 'TRANG CHỦ' : key === 'menu' ? 'THỰC ĐƠN' : key === 'cart' ? (
                  <>
                    GIỎ HÀNG
                    {cartItems.length > 0 && (
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
                  </>
                ) : key === 'staff' ? 'NHÂN VIÊN' : 'LIÊN HỆ'}
              </Button>
            ))}
          </Col>
        </Row>

        {/* Branch Selection Modal */}
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
                      <span style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                        {branch.Address}
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Modal>

        {/* Cart Modal */}
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
                      setActiveKey('menu');
                      const menuElement = document.getElementById('menu');
                      if (menuElement) {
                        menuElement.scrollIntoView({ behavior: 'smooth' });
                      }
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
                      marginRight: 16
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    {/* Tên món + Icon */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
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

                    {/* Ghi chú */}
                    {item.note && (
                      <Text style={{
                        color: '#999',
                        fontStyle: 'italic',
                        display: 'block',
                        marginTop: 4
                      }}>
                        Ghi chú: {item.note}
                      </Text>
                    )}

                    {/* Giá + số lượng */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8
                    }}>
                      <Text>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} 
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

              {/* Tổng tiền */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text strong style={{ color: 'black' }}>Tạm tính:</Text>
                <Text style={{ color: 'red' }}>
                  {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')} đnp
                </Text>
              </div>
            </div>
          )}
        </Modal>
        {/* Edit Cart Item Modal */}
        <Modal
          open={isEditModalVisible}
          title={
            <div style={{ backgroundColor: '#b4c80f', color: '#000', textAlign: 'center', padding: '8px', borderRadius: '4px 4px 0 0' }}>
              Cập nhật giỏ hàng
            </div>
          }
          onCancel={() => {
            setIsEditModalVisible(false);
            setIsCartModalVisible(true);
            setSelectedMenuItem(null);
            setQuantity(1);
            setNote('');
            setCartId(null);
          }}
          footer={null}
          width={400}
          centered
          closeIcon={<span style={{ color: '#000' }}>×</span>}
          styles={{
            content: { padding: '16px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' },
            mask: { zIndex: 1999, background: 'rgba(0, 0, 0, 0.5)' },
          }}
        >
          <div>
            <img
              src={selectedMenuItem?.image || 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={selectedMenuItem?.dishName}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
              {selectedMenuItem?.dishName || 'No name'}
            </Text>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
              {selectedMenuItem?.description || 'No description available'}
            </Text>
            <Text style={{ display: 'block', marginBottom: '16px', fontSize: '18px', color: '#ff0000' }}>
              {selectedMenuItem?.price?.toLocaleString('vi-VN') || '0'}đ
            </Text>
            <Input.TextArea
              placeholder="Ghi chú:"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ marginBottom: '16px', height: '60px', resize: 'none' }}
            />
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Button
                style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', borderRadius: '50%', width: '32px', height: '32px', marginRight: '8px' }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span style={{ fontSize: '16px', margin: '0 8px' }}>{quantity}</span>
              <Button
                style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', borderRadius: '50%', width: '32px', height: '32px', marginLeft: '8px' }}
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
                padding: '10px 20px',
                fontSize: '16px',
                width: '100%',
                borderRadius: '4px',
              }}
              onClick={handleUpdateCart}
            >
              Cập nhật giỏ hàng
            </Button>
          </div>
        </Modal>
      </Header>

      {activeKey === 'menu' && (
        <MenuPage
          onCartUpdate={handleCartUpdate}
          onShowCart={handleCartClick}
          selectedBranch={selectedBranch} // Truyền selectedBranch vào MenuPage
        />
      )}
    </>
  );
};

export default Navbar;