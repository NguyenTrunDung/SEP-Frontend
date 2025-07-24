import locale from 'antd/locale/vi_VN';
import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, Typography, Tabs, Spin, Alert, Layout, Button, message, Modal, Image, Input, Select, Rate, Avatar } from 'antd';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';
import { mockFeedbacks } from '../../mocks/mockFeedbacks';
import { mockFoodCategories, getMenuById } from '../../mocks/menuData';
import { useMenus } from '../../hooks/queries/useMenuQueries';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from '../../context/CartContext';
import { getImageUrl, getImageUrlWithFallback } from '../../utils/imageUtils';
import './Menu.css';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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
      tabBarStyle={{
        marginBottom: 5,
        backgroundColor: 'transparent',
        border: 'none',
      }}
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
                  src={getImageUrlWithFallback(category.Image, '/images/placeholder-food.png')}
                  alt={category.Name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
                  onError={(e) => {
                    e.target.src = '/images/placeholder-food.png';
                  }}
                />
              ) : (
                <img
                  src="/images/placeholder-food.png"
                  alt={category.Name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
                />
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

  const getFormattedDate = (dayKey) => {
    const dayOffset = parseInt(dayKey) - 1;
    const date = new Date();
    const currentDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() + (dayOffset - currentDayIndex));
    return date.toISOString().split('T')[0];
  };

  const currentDate = new Date();
  const [activeDay, setActiveDay] = useState(currentDate.getDay() === 0 ? '7' : currentDate.getDay().toString());
  const todayKey = currentDate.getDay() === 0 ? '7' : currentDate.getDay().toString();
  const isToday = activeDay === todayKey;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const categoryRefs = useRef({});

  const {
    data: menuData,
    isLoading: loading,
    error,
    refetch: refreshMenus
  } = useMenus({ date: getFormattedDate(activeDay) });

  const foods = menuData?.foods || [];
  const categories = menuData?.categories || [];
  const isUsingMockData = menuData?.isUsingMockData || false;

  useEffect(() => {
    if (foods.length > 0) {
      const sampleFood = foods[0];
      console.log('🖼️ Sample food image data:', {
        originalImageUrl: sampleFood.imageUrl,
        processedImageUrl: getImageUrl(sampleFood.imageUrl),
        fallbackImageUrl: getImageUrlWithFallback(sampleFood.imageUrl, '/images/placeholder-food.png')
      });
    }
    if (categories.length > 0) {
      const sampleCategory = categories[0];
      console.log('🖼️ Sample category image data:', {
        originalImageUrl: sampleCategory.imageUrl,
        processedImageUrl: getImageUrl(sampleCategory.imageUrl),
        fallbackImageUrl: getImageUrlWithFallback(sampleCategory.imageUrl, '/images/placeholder-food.png')
      });
    }
  }, [foods, categories]);

  useEffect(() => {
    if (selectedCategory) {
      const targetElement = categoryRefs.current[selectedCategory];
      if (targetElement) {
        console.log('Scrolling to category:', selectedCategory);
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        console.warn('Category ref not found for:', selectedCategory);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [activeDay]);

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
    if (categories.length > 0) {
      return categories.map(cat => ({
        ID: cat.id,
        Name: cat.name,
        Image: cat.imageUrl
      }));
    }

    const foodCategories = [...new Set(foods.map((food) => food.categoryId))];
    if (foodCategories.length === 0 && isUsingMockData) {
      return mockFoodCategories.map(cat => ({
        ...cat,
        Image: cat.Image
      }));
    }

    const uniqueCategories = [];
    foods.forEach(food => {
      if (!uniqueCategories.find(cat => cat.ID === food.categoryId)) {
        const categoryName = categoryMap[food.categoryId] || food.category || `Category ${food.categoryId}`;
        uniqueCategories.push({
          ID: food.categoryId,
          Name: categoryName,
          Image: null
        });
      }
    });

    return uniqueCategories;
  };

  const categoryMap = categories.reduce((map, cat) => {
    map[cat.id] = cat.name;
    return map;
  }, {});

  const groupedFoods = foods.length > 0 ? foods.reduce((acc, item) => {
    const categoryKey = categoryMap[item.categoryId] || item.category || `Category ${item.categoryId}`;
    if (!acc[categoryKey]) acc[categoryKey] = [];
    acc[categoryKey].push(item);
    return acc;
  }, {}) : {};

  const handleAddOrUpdateCart = (menuItem) => {
    if (typeof setCartItems !== 'function') {
      console.error('setCartItems is not a function:', setCartItems);
      message.error('Không thể thêm món vào giỏ hàng.');
      return;
    }

    const existingItem = cartItems.find((item) => item.FoodId === menuItem.id);
    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.FoodId === menuItem.id ? { ...item, quantity, note } : item
      );
      setCartItems(updatedItems);
      message.success(`${menuItem.name} đã được cập nhật trong giỏ hàng!`);
    } else {
      const newItem = {
        ...menuItem,
        quantity,
        cartId: uuidv4(),
        FoodId: menuItem.id,
        dishName: menuItem.name,
        price: menuItem.priceForGuest,
        image: getImageUrlWithFallback(menuItem.imageUrl, '/images/placeholder-food.png'),
        imageUrl: getImageUrlWithFallback(menuItem.imageUrl, '/images/placeholder-food.png'),
        ID: menuItem.id,
        note,
      };
      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      message.success(`${menuItem.name} đã được thêm vào giỏ hàng!`);
    }

    if (onCartUpdate) onCartUpdate();
    if (onShowCart) onShowCart();
    handleModalClose();
  };

  const handleShowDetails = async (menuItem) => {
    try {
      let detailedMenu = menuItem;
      if (isUsingMockData) {
        detailedMenu = await getMenuById(menuItem.id);
      }
      setSelectedMenuItem(detailedMenu);
      const existingItem = cartItems.find((item) => item.FoodId === menuItem.id);
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
    <ConfigProvider locale={locale}>
      <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 1200, margin: 'auto' }}>
            <MenuComponent activeKey={activeDay} onTabChange={(key) => setActiveDay(key)} />

            <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
              {formattedDate}
            </Title>

            {isToday ? (
              <>
                {foods.length > 0 && (
                  <CategoryCircles
                    categories={getFilteredCategories()}
                    selectedCategory={selectedCategory}
                    onCategorySelect={(categoryName) => {
                      console.log('Category selected:', categoryName);
                      setSelectedCategory(categoryName);
                    }}
                    dateLabel=""
                  />
                )}

                {error && !isUsingMockData && (
                  <Alert message={error?.message || 'Failed to load menu'} type="error" showIcon style={{ marginBottom: 16 }} />
                )}

                {loading ? (
                  <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
                ) : foods.length > 0 || isUsingMockData ? (
                  <div>
                    {Object.keys(groupedFoods).length > 0 ? (
                      Object.keys(groupedFoods).map((category) => (
                        <div
                          key={category}
                          style={{
                            marginBottom: '32px',
                            paddingTop: '20px',
                            scrollMarginTop: '140px'
                          }}
                          ref={(el) => {
                            if (el) {
                              categoryRefs.current[category] = el;
                              console.log('Set ref for category:', category);
                            }
                          }}
                        >
                          <Title
                            level={4}
                            style={{
                              marginBottom: 16,
                              color: '#000',
                              backgroundColor: selectedCategory === category ? '#f0f0f0' : 'transparent',
                              padding: '8px 0',
                              borderRadius: '4px'
                            }}
                          >
                            {category}
                          </Title>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {groupedFoods[category].map((item) => {
                              const isInCart = cartItems.some(cartItem => cartItem.FoodId === item.id);

                              return (
                                <div
                                  key={item.id}
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
                                    src={getImageUrlWithFallback(item.imageUrl, '/images/placeholder-food.png')}
                                    alt={item.name}
                                    preview={false}
                                    style={{ objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                                    fallback="/images/placeholder-food.png"
                                    onError={(e) => {
                                      console.warn('Failed to load image:', item.imageUrl);
                                    }}
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
                                      Đã thêm: {cartItems.find(cartItem => cartItem.FoodId === item.id)?.quantity || 0}
                                    </div>
                                  )}
                                  <Title level={5} style={{ marginBottom: 8 }}>{item.name}</Title>
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong style={{ fontSize: 14, color: '#222' }}>
                                      {item.priceForGuest.toLocaleString('vi-VN')}đ
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
                        style={{ color: 'red', textAlign: 'center', display: 'block', marginTop: 24, fontWeight: 'bold'  }}
                      >
                        Chưa có thực đơn.
                      </Text>
                    )}
                  </div>
                ) : (
                  <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 24, color: 'red', fontWeight: 'bold'  }}>
                    Chưa có thực đơn.
                  </Text>
                )}
              </>
            ) : (
              <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 24, color: 'red', fontWeight: 'bold' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                <div
                  style={{
                    backgroundColor: '#b4c80f',
                    color: '#000',
                    padding: '12px 16px',
                    fontSize: '18px',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  {cartItems.some(item => item.FoodId === selectedMenuItem?.id)
                    ? 'Cập nhật giỏ hàng'
                    : 'Thêm vào giỏ hàng'}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  <img
                    src={getImageUrlWithFallback(
                      selectedMenuItem?.imageUrl || selectedMenuItem?.image,
                      '/images/placeholder-food.png'
                    )}
                    alt={selectedMenuItem?.name || selectedMenuItem?.dishName}
                    style={{
                      width: '100%',
                      maxHeight: '250px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.png';
                      console.warn('Failed to load modal image:', selectedMenuItem?.imageUrl);
                    }}
                  />
                  <div style={{ padding: '6px 6px 0' }}>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '1px',
                      }}
                    >
                      {selectedMenuItem?.name || selectedMenuItem?.dishName || 'No name'}
                    </Text>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: '15px',
                        color: '#555',
                        marginBottom: '1px',
                      }}
                    >
                      {selectedMenuItem?.description || 'No description available'}
                    </Text>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#ff0000',
                        marginBottom: '1px',
                      }}
                    >
                      {(selectedMenuItem?.priceForGuest || selectedMenuItem?.price)?.toLocaleString('vi-VN') || '0'}đ
                    </Text>
                  </div>
                  <div style={{ padding: '0 6px' }}>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '0px',
                      }}
                    >
                      Ghi chú:
                    </Text>
                    <Input.TextArea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      style={{
                        marginBottom: '20px',
                        height: '115px',
                        resize: 'none',
                      }}
                      placeholder="Ghi chú..."
                    />
                  </div>
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
                  <div style={{ padding: '16px', background: '#fff' }}>
                    {mockFeedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        style={{
                          borderBottom: '1px solid #f0f0f0',
                          padding: '16px 0',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Avatar
                            size={48}
                            src={feedback.user?.avatar}
                            icon={!feedback.user?.avatar && <UserOutlined />}
                            style={{ marginRight: 12 }}
                          />
                          <Text strong>{feedback.customerName || 'Ẩn danh'}</Text>
                        </div>
                        <div style={{ paddingLeft: 60 }}>
                          <div style={{ marginBottom: 8 }}>
                            <Rate
                              value={feedback.rating}
                              disabled
                              style={{ fontSize: 16, color: '#fadb14' }}
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text>{feedback.content}</Text>
                          </div>
                          {Array.isArray(feedback.images) && feedback.images.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <img
                                src={feedback.images[0].url}
                                alt="Feedback"
                                style={{
                                  width: 160,
                                  height: 160,
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                  borderRadius: 4,
                                }}
                              />
                            </div>
                          )}
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {feedback.createdAt}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px 16px' }}>
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
                    onClick={() => handleAddOrUpdateCart(selectedMenuItem)}
                  >
                    {cartItems.some(item => item.FoodId === selectedMenuItem?.id)
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