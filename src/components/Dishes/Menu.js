import React, { useState, useEffect, useRef } from 'react';
import { Typography, Tabs, Spin, Alert, Layout, Button, message, Modal, Image, Input, Select } from 'antd';
import PropTypes from 'prop-types';
import { mockFoodCategories, getMenuById } from '../../mocks/menuData';
import { useMenus } from '../../hooks/queries/useMenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from '../../context/CartContext';
import './Menu.css';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const MenuComponent = ({ activeKey, onTabChange }) => (
  <Tabs
    activeKey={activeKey}
    onChange={onTabChange}
    centered
    size="large"
    animated={false}
    tabBarStyle={{
      marginBottom: 5,
      backgroundColor: 'transparent',
      border: 'none',
    }}
    tabBarGutter={0.5}
    tabBarExtraContent={<div style={{ display: 'none' }} />}
  >
    {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((day, index) => (
      <TabPane
        tab={
          <span
            style={{
              color: activeKey === (index + 1).toString() ? '#b4c80f' : '#000',
              backgroundColor: 'transparent',
              padding: '10px 18px',
              border: '1px solid #d9d9d9',
              borderRadius: 1,
              borderBottom: activeKey === (index + 1).toString() ? '3px solid #b4c80f' : '1px solid #d9d9d9',
            }}
          >
            {day}
          </span>
        }
        key={(index + 1).toString()}
      />
    ))}
  </Tabs>
);

const CategoryCircles = ({ categories, selectedCategory, onCategorySelect, dateLabel }) => (
  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
    <Title level={4} style={{ marginBottom: 16 }}>{dateLabel}</Title>
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.Name;
        return (
          <div
            key={category.ID}
            onClick={() => onCategorySelect(isSelected ? null : category.Name)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: `2px solid ${isSelected ? '#000' : '#d9d9d9'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? '0 0 8px rgba(0, 0, 0, 0.2)' : '0 0 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {category.Image ? (
                <img
                  src={category.Image}
                  alt={category.Name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <div style={{ width: 80, height: 80, backgroundColor: '#ccc', borderRadius: '50%' }} />
              )}
            </div>
            <span style={{ fontSize: 12, marginTop: 8, color: '#000', fontWeight: isSelected ? 'bold' : 'normal' }}>
              {category.Name}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const MenuPage = ({ onCartUpdate, onShowCart }) => {
  const { cartItems, setCartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  console.log('MenuPage context:', { cartItems, setCartItems: typeof setCartItems });

  const getFormattedDate = (dayKey) => {
    const dayOffset = parseInt(dayKey) - 1;
    const date = new Date();
    const currentDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() + (dayOffset - currentDayIndex));
    return date.toISOString().split('T')[0];
  };

  const currentDate = new Date();
  const [activeDay, setActiveDay] = useState(currentDate.getDay() === 0 ? '7' : currentDate.getDay().toString());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    deliveryAddress: '',
    phoneNumber: '',
    paymentMethod: 'Tiền mặt',
    note: '',
    change: '',
    room: '',
    deliveryTime: '',
    total: 0,
  });
  const categoryRefs = useRef({});

  const { menus, loading, error, isUsingMockData } = useMenus({ date: getFormattedDate(activeDay) });

  useEffect(() => {
    if (selectedCategory) {
      categoryRefs.current[selectedCategory]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formatted = formatter.format(date);
    const [weekday, rest] = formatted.split(', ');
    return `${weekday.toUpperCase()} - ${rest}`;
  };

  const getFilteredCategories = () => {
    const menuCategories = [...new Set(menus.map((menu) => menu.category))];
    if (menuCategories.length === 0 && isUsingMockData) {
      return mockFoodCategories;
    }
    return mockFoodCategories.filter((category) => menuCategories.includes(category.Name));
  };

  const groupedMenus = menus.length > 0 ? menus.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) : {};

  const handleAddOrUpdateCart = (menuItem) => {
    if (typeof setCartItems !== 'function') {
      console.error('setCartItems is not a function:', setCartItems);
      message.error('Không thể thêm món vào giỏ hàng.');
      return;
    }

    const existingItem = cartItems.find((item) => item.FoodId === menuItem.ID);
    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.FoodId === menuItem.ID ? { ...item, quantity, note } : item
      );
      setCartItems(updatedItems);
      message.success(`${menuItem.dishName} đã được cập nhật trong giỏ hàng!`);
    } else {
      const newItem = {
        ...menuItem,
        quantity,
        cartId: uuidv4(),
        FoodId: menuItem.ID,
        note,
      };
      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      message.success(`${menuItem.dishName} đã được thêm vào giỏ hàng!`);
    }

    setPaymentDetails({
      ...paymentDetails,
      total: menuItem.price * quantity,
    });
    setPaymentModalVisible(true); // Show payment popup
    handleModalClose();
  };

  const handlePaymentSubmit = () => {
    message.success('Đặt món thành công!');
    setPaymentModalVisible(false);
    if (onCartUpdate) onCartUpdate();
    if (onShowCart) onShowCart();
  };

  const handleShowDetails = async (menuItem) => {
    try {
      const detailedMenu = await getMenuById(menuItem.ID);
      setSelectedMenuItem(detailedMenu);
      const existingItem = cartItems.find((item) => item.FoodId === menuItem.ID);
      if (existingItem) {
        setQuantity(existingItem.quantity);
        setNote(existingItem.note || '');
      } else {
        setQuantity(1);
        setNote('');
      }
      setIsModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết món ăn.');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMenuItem(null);
    setNote('');
    setQuantity(1);
  };

  const formattedDate = formatDisplayDate(getFormattedDate(activeDay));

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: 'auto' }}>
          <MenuComponent activeKey={activeDay} onTabChange={(key) => setActiveDay(key)} />

          <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
            Thực đơn {formattedDate}
          </Title>

          {menus.length > 0 && (
            <CategoryCircles
              categories={getFilteredCategories()}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              dateLabel=""
            />
          )}

          {error && !isUsingMockData && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}

          {loading ? (
            <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
          ) : menus.length > 0 || isUsingMockData ? (
            <div>
              {Object.keys(groupedMenus).length > 0 ? (
                Object.keys(groupedMenus).map((category) => (
                  <div key={category} style={{ marginBottom: '32px' }} ref={(el) => (categoryRefs.current[category] = el)}>
                    <Title level={4} style={{ marginBottom: 16, color: '#000' }}>
                      {category}
                    </Title>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {groupedMenus[category].map((item) => {
                        const isInCart = cartItems.some(cartItem => cartItem.FoodId === item.ID);

                        return (
                          <div
                            key={item.ID}
                            style={{
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              padding: 10,
                              width: 220,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                              background: '#fff',
                              position: 'relative',
                            }}
                          >
                            <Image
                              width={200}
                              height={140}
                              src={item.image || 'https://via.placeholder.com/200x140?text=No+Image'}
                              alt={item.dishName}
                              preview={false}
                              style={{ objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                            />
                            {isInCart && (
                              <div style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: '#b4c80f',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '16px',
                              }}>
                                Đã thêm: {cartItems.find(cartItem => cartItem.FoodId === item.ID)?.quantity || 0}
                              </div>
                            )}
                            <Title level={5} style={{ marginBottom: 8 }}>{item.dishName}</Title>
                            <div style={{ marginBottom: 4 }}>
                              <Text strong style={{ fontSize: 14, color: '#222' }}>
                                {item.price.toLocaleString('vi-VN')}đ
                              </Text>
                            </div>
                            <Button
                              style={{
                                backgroundColor: '#b4c80f',
                                borderColor: '#b4c80f',
                                color: '#000',
                                float: 'left',
                                padding: '14px 12px',
                                fontSize: '15px',
                              }}
                              type="primary"
                              size="small"
                              onClick={() => handleShowDetails(item)}
                            >
                              {isInCart ? 'Cập nhật giỏ hàng' : 'Thêm'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <Text
                  style={{ color: 'red', textAlign: 'center', display: 'block', marginTop: 24 }}
                >
                  Chưa có thực đơn.
                </Text>
              )}
            </div>
          ) : (
            <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 24 }}>
              Chưa có thực đơn.
            </Text>
          )}
          <Modal
            visible={isModalVisible}
            title={
              <div style={{ backgroundColor: '#b4c80f', color: '#000', textAlign: 'center', padding: '8px', borderRadius: '4px 4px 0 0' }}>
                {cartItems.some(item => item.FoodId === selectedMenuItem?.ID) ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng'}
              </div>
            }
            onCancel={handleModalClose}
            footer={null}
            width={400}
            closeIcon={<span style={{ color: '#000' }}>×</span>}
            styles={{ content: { padding: '16px', textAlign: 'center' } }}
          >
            <div>
              <Image
                src={selectedMenuItem?.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={selectedMenuItem?.dishName}
                width={300}
                height={200}
                style={{
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
              <div style={{ marginBottom: '16px' }}>
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
                }}
                onClick={() => handleAddOrUpdateCart(selectedMenuItem)}
              >
                {cartItems.some(item => item.FoodId === selectedMenuItem?.ID) ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng'}
              </Button>
            </div>
          </Modal>
          <Modal
            visible={paymentModalVisible}
            title={
              <div style={{ backgroundColor: '#b4c80f', color: '#000', textAlign: 'center', padding: '8px', borderRadius: '4px 4px 0 0' }}>
                Thanh toán
              </div>
            }
            onCancel={() => setPaymentModalVisible(false)}
            footer={[
              <Button
                key="submit"
                style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', padding: '10px 20px', fontSize: '16px', width: '100%' }}
                onClick={handlePaymentSubmit}
              >
                Đặt hàng
              </Button>,
            ]}
            width={400}
            closeIcon={<span style={{ color: '#000' }}>×</span>}
            styles={{ content: { padding: '16px' } }}
          >
            <div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Thành tiền</Text>
                <Input
                  value={`${paymentDetails.total.toLocaleString('vi-VN')}đ`}
                  disabled
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Đến địa chỉ</Text>
                <Input
                  placeholder="Nhập địa chỉ giao hàng"
                  value={paymentDetails.deliveryAddress}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, deliveryAddress: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Số điện thoại</Text>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Hình thức thanh toán</Text>
                <Select
                  value={paymentDetails.paymentMethod}
                  onChange={(value) => setPaymentDetails({ ...paymentDetails, paymentMethod: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="Tiền mặt">Tiền mặt</Option>
                  <Option value="Chuyển khoản">Chuyển khoản</Option>
                </Select>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Tiền thối lại</Text>
                <Input
                  placeholder="Nhập số tiền thối lại (nếu có)"
                  value={paymentDetails.change}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, change: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Ghi chú</Text>
                <Input.TextArea
                  placeholder="Nhập ghi chú"
                  value={paymentDetails.note}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, note: e.target.value })}
                  style={{ width: '100%', height: '60px', resize: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Khưu</Text>
                <Input
                  placeholder="Khưu"
                  disabled
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Phòng</Text>
                <Input
                  placeholder="Nhập phòng (nếu có)"
                  value={paymentDetails.room}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, room: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ display: 'block', marginBottom: '4px' }}>Thời gian giao hàng</Text>
                <Input
                  placeholder="Nhập thời gian giao hàng (nếu có)"
                  value={paymentDetails.deliveryTime}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, deliveryTime: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  style={{ marginRight: '8px' }}
                  onChange={(e) => console.log('Đặt địa chỉ mặc định:', e.target.checked)}
                />
                <Text>Đặt địa chỉ này là địa chỉ mặc định của website</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Text strong>Đơn hàng: {`${paymentDetails.total.toLocaleString('vi-VN')}đ`}</Text>
                <Text strong>Tổng: {`${(paymentDetails.total + 5000).toLocaleString('vi-VN')}đ`}</Text>
              </div>
            </div>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

MenuPage.propTypes = {
  onCartUpdate: PropTypes.func,
  onShowCart: PropTypes.func,
};

export default MenuPage;