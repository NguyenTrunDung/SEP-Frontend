// components/MenuPage.js
import locale from 'antd/locale/vi_VN';
import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, Typography, Tabs, Spin, Alert, Layout, Button, message, Modal, Image, Input } from 'antd';
import PropTypes from 'prop-types';
import { useMenus } from '../../hooks/queries/useMenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from '../../context/CartContext';
import './Menu.css';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Hàm tạo danh sách các ngày trong tuần bằng tiếng Việt
const getVietnameseDays = () => {
  const formatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
  const days = [];
  const baseDate = new Date(2025, 0, 6); // Bắt đầu từ thứ Hai (ngày 6/1/2025)

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const dayName = formatter.format(date);
    days.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
  }

  return days;
};

const MenuComponent = ({ activeKey, onTabChange }) => {
  const vietnameseDays = getVietnameseDays();

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onTabChange}
      centered
      size="large"
      animated={false}
      tabBarStyle={{ marginBottom: 5, backgroundColor: 'transparent', border: 'none' }}
      tabBarGutter={0.5}
      tabBarExtraContent={<div style={{ display: 'none' }} />}
    >
      {vietnameseDays.map((day, index) => (
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
};

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
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
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
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const categoryRefs = useRef({});

  const { menus, categories, loading, error, refreshMenus } = useMenus({ date: getFormattedDate(activeDay) });

  useEffect(() => {
    if (selectedCategory) {
      categoryRefs.current[selectedCategory]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const formatDisplayDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
      const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const weekday = weekdayFormatter.format(date).toUpperCase();
      const formattedDate = dateFormatter.format(date);
      return `Thực đơn ${weekday} - ${formattedDate}`;
    } catch (error) {
      console.warn('Date formatting error:', error);
      return `Thực đơn ${dateStr}`;
    }
  };

  const getFilteredCategories = () => {
    return categories.length > 0 ? categories : [];
  };

  const groupedMenus = menus.length > 0 ? menus.reduce((acc, item) => {
    const categoryName = item.category || 'Chưa phân loại';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {}) : {};

  const handleAddOrUpdateCart = (menuItem) => {
    if (typeof setCartItems !== 'function') {
      console.error('setCartItems is not a function:', setCartItems);
      message.error('Không thể thêm món vào giỏ hàng.');
      return;
    }

    const existingItem = cartItems.find((item) => item.ID === menuItem.ID);
    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.ID === menuItem.ID ? { ...item, quantity, note } : item
      );
      setCartItems(updatedItems);
      message.success(`${menuItem.dishName} đã được cập nhật trong giỏ hàng!`);
    } else {
      const newItem = {
        ...menuItem,
        quantity,
        cartId: uuidv4(),
        note,
      };
      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      message.success(`${menuItem.dishName} đã được thêm vào giỏ hàng!`);
    }

    if (onCartUpdate) onCartUpdate();
    if (onShowCart) onShowCart();
    handleModalClose();
  };

  const handleShowDetails = (menuItem) => {
    setSelectedMenuItem(menuItem);
    const existingItem = cartItems.find((item) => item.ID === menuItem.ID);
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setNote(existingItem.note || '');
    } else {
      setQuantity(1);
      setNote('');
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMenuItem(null);
    setNote('');
    setQuantity(1);
  };

  const formattedDate = formatDisplayDate(getFormattedDate(activeDay));

  return (
    <ConfigProvider locale={locale}>
      <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 1200, margin: 'auto' }}>
            <MenuComponent activeKey={activeDay} onTabChange={(key) => setActiveDay(key)} />

            <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
              {formattedDate}
            </Title>

            {menus.length > 0 && categories.length > 0 && (
              <CategoryCircles
                categories={getFilteredCategories()}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                dateLabel=""
              />
            )}

            {error && (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            {loading ? (
              <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
            ) : menus.length > 0 ? (
              <div>
                {Object.keys(groupedMenus).length > 0 ? (
                  Object.keys(groupedMenus).map((category) => (
                    <div key={category} style={{ marginBottom: '32px' }} ref={(el) => (categoryRefs.current[category] = el)}>
                      <Title level={4} style={{ marginBottom: 16, color: '#000' }}>
                        {category}
                      </Title>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        {groupedMenus[category].map((item) => {
                          const isInCart = cartItems.some(cartItem => cartItem.ID === item.ID);

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
                                  Đã thêm: {cartItems.find(cartItem => cartItem.ID === item.ID)?.quantity || 0}
                                </div>
                              )}
                              <Title level={5} style={{ marginBottom: 8 }}>{item.dishName}</Title>
                              <div style={{ marginBottom: 4 }}>
                                <Text strong style={{ fontSize: 14, color: '#222' }}>
                                  {item.price?.toLocaleString('vi-VN') || '0'}đ
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
                  <Text style={{ color: 'red', textAlign: 'center', display: 'block', marginTop: 24 }}>
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
              onCancel={handleModalClose}
              footer={null}
              width={600}
              centered
              closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
              styles={{
                content: { padding: 0, background: '#fff', borderRadius: '8px' },
                body: { padding: 0 },
              }}
            >
              <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#b4c80f', color: '#000', padding: '12px 16px', fontSize: '18px' }}>
                  {cartItems.some(item => item.ID === selectedMenuItem?.ID)
                    ? 'Cập nhật giỏ hàng'
                    : 'Thêm vào giỏ hàng'}
                </div>
                <img
                  src={selectedMenuItem?.image || 'https://via.placeholder.com/600x250?text=No+Image'}
                  alt={selectedMenuItem?.dishName}
                  style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '6px 6px 0' }}>
                  <Text style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '1px' }}>
                    {selectedMenuItem?.dishName || 'No name'}
                  </Text>
                  <Text style={{ display: 'block', fontSize: '15px', color: '#555', marginBottom: '1px' }}>
                    {selectedMenuItem?.description || 'No description available'}
                  </Text>
                  <Text style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#ff0000', marginBottom: '1px' }}>
                    {selectedMenuItem?.price?.toLocaleString('vi-VN') || '0'}đ
                  </Text>
                </div>
                <div style={{ padding: '0 6px' }}>
                  <Text style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '0px' }}>
                    Ghi chú:
                  </Text>
                  <Input.TextArea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ marginBottom: '20px', height: '115px', resize: 'none' }}
                    placeholder="Ghi chú..."
                  />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <Button
                    style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', fontWeight: 'bold' }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span style={{ margin: '0 16px', fontSize: '16px' }}>{quantity}</span>
                  <Button
                    style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', fontWeight: 'bold' }}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px 16px' }}>
                  <Button
                    style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000', width: '100%', padding: '18px', fontSize: '16px', borderRadius: '6px' }}
                    onClick={() => handleAddOrUpdateCart(selectedMenuItem)}
                  >
                    {cartItems.some(item => item.ID === selectedMenuItem?.ID)
                      ? 'Cập nhật giỏ hàng'
                      : 'Thêm vào giỏ hàng'}
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

MenuPage.propTypes = {
  onCartUpdate: PropTypes.func,
  onShowCart: PropTypes.func,
};

export default MenuPage;