import React, { useState, useEffect, useRef } from 'react';
import { Typography, Tabs, Spin, Alert, Layout, Button, message, Modal, Image, InputNumber } from 'antd';
import { mockFoodCategories, getMenuById } from '../../mocks/menuData';
import { useMenus } from '../../hooks/queries/useMenu';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const MenuComponent = ({ activeKey, onTabChange }) => (
  <Tabs
    activeKey={activeKey}
    onChange={onTabChange}
    centered
    size="large"
    tabBarStyle={{ marginBottom: 24, fontWeight: 'bold' }}
  >
    <TabPane tab="Monday" key="1" />
    <TabPane tab="Tuesday" key="2" />
    <TabPane tab="Wednesday" key="3" />
    <TabPane tab="Thursday" key="4" />
    <TabPane tab="Friday" key="5" />
    <TabPane tab="Saturday" key="6" />
    <TabPane tab="Sunday" key="7" />
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

const MenuPage = () => {
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
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const categoryRefs = useRef({});
  const navigate = useNavigate();

  const { menus, loading, error, isUsingMockData } = useMenus({ date: getFormattedDate(activeDay) });

  // Load cart items from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart items to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (selectedCategory) {
      categoryRefs.current[selectedCategory]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
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

  const handleAddToCart = (menuItem) => {
    const newItem = {
      ...menuItem,
      quantity,
      cartId: uuidv4(),
      FoodId: menuItem.ID, // Map ID to FoodId for consistency
    };
    setCartItems((prevItems) => [...prevItems, newItem]);
    message.success(`${menuItem.dishName} added to cart!`);
    setIsCartModalVisible(true);
  };

  const handleShowDetails = async (menuItem, e) => {
    if (e.target.tagName !== 'BUTTON') {
      try {
        const detailedMenu = await getMenuById(menuItem.ID);
        setSelectedMenuItem(detailedMenu);
        setQuantity(1);
        setIsModalVisible(true);
      } catch (err) {
        message.error('Failed to load dish details.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMenuItem(null);
  };

  const handleCartModalClose = () => {
    setIsCartModalVisible(false);
  };

  const handleGoToCart = () => {
    setIsCartModalVisible(false);
    navigate('/cart', { state: { cartItems } });
  };

  const handleRemoveCartItem = (cartId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
    message.success('Item removed from cart.');
  };

  const formattedDate = formatDisplayDate(getFormattedDate(activeDay));

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: 'auto' }}>
          <MenuComponent activeKey={activeDay} onTabChange={(key) => setActiveDay(key)} />

          <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
            Menu for {formattedDate}
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
                      {groupedMenus[category].map((item) => (
                        <div
                          key={item.ID}
                          onClick={(e) => handleShowDetails(item, e)}
                          style={{
                            cursor: 'pointer',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            padding: 12,
                            width: 220,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            background: '#fff',
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
                          <Title level={5} style={{ marginBottom: 8 }}>{item.dishName}</Title>
                          <Text strong style={{ fontSize: 14, color: '#222' }}>{item.price.toLocaleString('vi-VN')} VND</Text>
                          <Button
                            type="primary"
                            block
                            style={{ marginTop: 8 }}
                            onClick={() => handleAddToCart(item)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <Text
                  style={{ color: 'red', textAlign: 'center', display: 'block', marginTop: 24 }}
                >
                  No menu available for this day.
                </Text>
              )}
            </div>
          ) : (
            <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 24 }}>
              No menu available for this day.
            </Text>
          )}
          <Modal
            visible={isModalVisible}
            title={selectedMenuItem?.dishName || 'Dish Details'}
            onCancel={handleModalClose}
            footer={[
              <Button key="cancel" onClick={handleModalClose}>
                Close
              </Button>,
              <Button
                key="add"
                type="primary"
                onClick={() => {
                  handleAddToCart(selectedMenuItem);
                  handleModalClose();
                }}
              >
                Add to Cart
              </Button>,
            ]}
            width={400} // Set a reasonable modal width
            bodyStyle={{ padding: '16px' }} // Consistent padding
          >
            <div style={{ textAlign: 'center' }}>
              <Image
                src={selectedMenuItem?.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={selectedMenuItem?.dishName}
                width={300} // Fixed width for the image
                height={200} // Fixed height for the image
                style={{
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />
            </div>
            <Text style={{ display: 'block', marginBottom: '16px', textAlign: 'center' }}>
              {selectedMenuItem?.description || 'No description available.'}
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
              <Text strong style={{ marginRight: '8px' }}>Quantity: </Text>
              <InputNumber
                min={1}
                max={10}
                value={quantity}
                onChange={setQuantity}
                size="middle"
              />
            </div>
          </Modal>

          <Modal
            visible={isCartModalVisible}
            title="Your Cart"
            onCancel={handleCartModalClose}
            footer={[
              <Button key="continue" onClick={handleCartModalClose}>
                Continue Shopping
              </Button>,
              <Button key="cart" type="primary" onClick={handleGoToCart} disabled={cartItems.length === 0}>
                Go to Cart
              </Button>,
            ]}
          >
            {cartItems.length === 0 ? (
              <Text>Your cart is empty.</Text>
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
                    <Image
                      src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                      alt={item.dishName}
                      width={50}
                      height={50}
                      style={{ objectFit: 'cover', borderRadius: 4, marginRight: 16 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.dishName}</Text>
                      <br />
                      <Text>Quantity: {item.quantity}</Text>
                      <br />
                      <Text>Price: {(item.price * item.quantity).toLocaleString('vi-VN')} VND</Text>
                    </div>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleRemoveCartItem(item.cartId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Text strong>
                  Total: {cartItems
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toLocaleString('vi-VN')} VND
                </Text>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MenuPage;