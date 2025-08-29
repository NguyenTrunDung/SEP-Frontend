import locale from 'antd/locale/vi_VN';
import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, Typography, Tabs, Spin, Alert, Layout, Button, message, Modal, Image, Input, Rate, Avatar } from 'antd';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';
import { mockFoodCategories, getMenuById } from '../../mocks/menuData';
import { useMenus } from '../../hooks/queries/useMenuQueries';
import { useFeedbacksByFood } from '../../hooks/queries/useFeedback';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from '../../context/CartContext';
import { getImageUrl, getImageUrlWithFallback } from '../../utils/imageUtils';
import environment from '../../config/environment';
import './Menu.css';
import { useTimezone } from '../../hooks/useTimezone';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const MenuComponent = ({ activeKey, onTabChange }) => {
  const { format } = useTimezone();

  // Hàm tạo danh sách các ngày trong tuần bằng tiếng Việt
  const getVietnameseDays = () => {
    const days = [];
    const today = new Date();

    // Find the start of the current week (Monday)
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      const dayName = format.date(date, 'dddd');
      days.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
    }

    return days;
  };

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
  console.log('MenuPage context:', { cartItems, setCartItems: typeof setCartItems });

  const { format } = useTimezone();

  const getFormattedDate = (dayKey) => {
    const dayOffset = parseInt(dayKey) - 1; // Convert 1-7 to 0-6

    // Get current date using timezone utilities
    const today = new Date();

    // Find the start of the current week (Monday)
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    // Calculate the target date by adding the day offset to Monday
    const targetDate = new Date(mondayDate);
    targetDate.setDate(mondayDate.getDate() + dayOffset);

    // Format the date using timezone utilities for consistency
    const formattedDate = format.date(targetDate, 'YYYY-MM-DD');

    // Debug logging for date calculations
    if (environment.features.enableLogging) {
      console.log(`📅 Date calculation for day ${dayKey}:`, {
        today: today.toISOString(),
        currentDay,
        mondayOffset,
        mondayDate: mondayDate.toISOString(),
        dayOffset,
        targetDate: targetDate.toISOString(),
        formattedDate
      });
    }

    return formattedDate;
  };

  // Helper function to get current week dates for debugging
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      weekDates.push({
        dayIndex: i + 1,
        date: date.toISOString().split('T')[0],
        dayName: format.date(date, 'dddd'),
        isToday: date.toDateString() === today.toDateString()
      });
    }

    return weekDates;
  };

  /**
   * Date Calculation Logic:
   * - Day keys: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
   * - We find the current week's Monday and calculate dates from there
   * - This ensures the displayed week always matches the current calendar week
   * - No more hardcoded dates or incorrect week calculations
   */

  // Validation function to ensure current date is correct
  const validateCurrentDate = () => {
    const today = new Date();
    const currentWeekDates = getCurrentWeekDates();
    const todayInWeek = currentWeekDates.find(day => day.isToday);

    if (environment.features.enableLogging) {
      console.log('✅ Date validation:', {
        currentDate: today.toISOString(),
        currentDateFormatted: format.date(today, 'DD/MM/YYYY'),
        currentWeekDates: currentWeekDates.map(d => `${d.dayIndex}: ${d.date} (${d.dayName})`),
        todayInWeek: todayInWeek ? `${todayInWeek.dayIndex}: ${todayInWeek.date} (${todayInWeek.dayName})` : 'Not found',
        activeDay,
        activeDayDate: getFormattedDate(activeDay)
      });
    }

    return todayInWeek;
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

  // Use state instead of environment for immediate reactivity
  const [currentBranchId, setCurrentBranchId] = useState(() =>
    environment.multiTenant.getCurrentBranchId()
  );

  // Listen for branch changes
  useEffect(() => {
    const handleBranchChange = () => {
      const newBranchId = environment.multiTenant.getCurrentBranchId();
      if (newBranchId !== currentBranchId) {
        console.log('🔄 Branch changed in Menu.js:', { old: currentBranchId, new: newBranchId });
        setCurrentBranchId(newBranchId);
      }
    };

    // Check for branch changes every 100ms for immediate updates
    const interval = setInterval(handleBranchChange, 100);

    // Also listen for storage events (if user switches branch in another tab)
    window.addEventListener('storage', handleBranchChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleBranchChange);
    };
  }, [currentBranchId]);

  // Use React Query hooks for menu data with branch context
  const {
    data: menuData,
    isLoading: loading,
    error
  } = useMenus({ date: getFormattedDate(activeDay), branchId: currentBranchId });

  // Debug logging for current week dates
  useEffect(() => {
    if (environment.features.enableLogging) {
      const weekDates = getCurrentWeekDates();
      console.log('📅 Current week dates:', weekDates);
      console.log('🎯 Active day:', activeDay);
      console.log('📅 Formatted date for active day:', getFormattedDate(activeDay));
    }
  }, [activeDay]);

  // Validate current date on component mount
  useEffect(() => {
    validateCurrentDate();
  }, []);


  // Fetch feedbacks for the selected food
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const {
    data: feedbacks,
    isLoading: isFeedbackLoading,
    error: feedbackError
  } = useFeedbacksByFood(selectedMenuItem?.id, branchId, {
    enabled: !!selectedMenuItem?.id
  });

  // Extract data from the response
  const foods = menuData?.foods || [];
  const categories = menuData?.categories || [];
  const isUsingMockData = menuData?.isUsingMockData || false;

  // Debug logging for image URLs
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

  // Clear selected category when switching days
  useEffect(() => {
    setSelectedCategory(null);
  }, [activeDay]);

  const formatDisplayDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const weekday = format.date(date, 'dddd').toUpperCase();
      const formattedDate = format.date(date, 'DD/MM/YYYY');
      return `Thực đơn ${weekday} - ${formattedDate}`;
    } catch (error) {
      console.warn('Date formatting error:', error);
      return `Thực đơn ${dateStr}`;
    }
  };

  const getFilteredCategories = () => {
    // Check if current time is past 11 AM
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const isPast11AM = currentHour >= 11;

    let filteredCategories = [];
    if (categories.length > 0) {
      filteredCategories = categories.map(cat => ({
        ID: cat.id,
        Name: cat.name,
        Image: cat.imageUrl
      }));
    } else {
      const foodCategories = [...new Set(foods.map((food) => food.categoryId))];
      if (foodCategories.length === 0 && isUsingMockData) {
        filteredCategories = mockFoodCategories.map(cat => ({
          ...cat,
          Image: cat.Image
        }));
      } else {
        filteredCategories = foods.reduce((acc, food) => {
          if (!acc.find(cat => cat.ID === food.categoryId)) {
            const categoryName = categoryMap[food.categoryId] || food.category || `Category ${food.categoryId}`;
            acc.push({
              ID: food.categoryId,
              Name: categoryName,
              Image: null
            });
          }
          return acc;
        }, []);
      }
    }

    // Filter out "Điểm tâm" category if past 11 AM and it's today
    if (isToday && isPast11AM) {
      filteredCategories = filteredCategories.filter(category => category.Name.toLowerCase() !== 'điểm tâm');
    }

    return filteredCategories;
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
    
    // Check if adding would exceed 10 items
    const newTotalQuantity = existingItem 
      ? existingItem.quantity + quantity 
      : quantity;

    if (existingItem) {
      if (newTotalQuantity > 10) {
        message.warning('Số lượng tối đa là 10 suất.');
        return;
      }
    } else if (quantity > 10) {
      message.warning('Số lượng tối đa là 10 suất.');
      return;
    }

    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.FoodId === menuItem.id ? { ...item, quantity: newTotalQuantity, note } : item
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
                  // Filter out "Điểm tâm" category if past 11 AM and it's today
                  Object.keys(groupedFoods)
                    .filter(category => !(isToday && new Date().getHours() >= 11 && category.toLowerCase() === 'điểm tâm'))
                    .map((category) => {
                      console.log('Rendering category section:', category);
                      return (
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
                                    {isToday && isInCart ? 'Cập nhật giỏ hàng' : isToday ? 'Thêm' : 'Xem chi tiết'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
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
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div
                  style={{
                    backgroundColor: '#b4c80f',
                    color: '#000',
                    padding: '12px 16px',
                    fontSize: '18px',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  {isToday && cartItems.some(item => item.FoodId === selectedMenuItem?.id)
                    ? 'Cập nhật giỏ hàng'
                    : isToday ? 'Thêm vào giỏ hàng' : 'Chi tiết món ăn'}
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
                  {isToday && (
                    <>
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
                          onClick={() => {
                            if (quantity >= 10) {
                              message.warning('Số lượng tối đa là 10 suất.');
                            } else {
                              setQuantity(quantity + 1);
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </>
                  )}
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
                      Đánh giá món ăn
                    </Text>
                  </div>
                  <div style={{ padding: '16px', background: '#fff' }}>
                    {isFeedbackLoading ? (
                      <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
                    ) : feedbackError ? (
                      <Alert
                        message="Không thể tải đánh giá"
                        description={feedbackError.message || 'Vui lòng thử lại sau.'}
                        type="error"
                        showIcon
                      />
                    ) : feedbacks && feedbacks.length > 0 ? (
                      feedbacks.map((feedback) => (
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
                              src={feedback.avatar}
                              icon={!feedback.avatar && <UserOutlined />}
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
                            {/* {Array.isArray(feedback.images) && feedback.images.length > 0 && (
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
                            )} */}
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {format.dateTime(feedback.timestamp, 'DD/MM/YYYY HH:mm')}
                            </Text>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">Chưa có đánh giá nào cho món ăn này.</Text>
                    )}
                  </div>
                </div>
                {isToday && (
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
                )}
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