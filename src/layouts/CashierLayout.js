import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Button, Input, Card, DatePicker, Spin, Row, Col, Space, message, Modal, Table, Statistic, Typography } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { useMenus } from '../hooks/queries/useMenuQueries';
import { usePublicBranchesOnly, usePublicCurrentBranchOnly, usePublicSwitchBranchOnly } from '../hooks/queries/useBranchSelector';
import { branchService } from '../services/branchService';
import { getImageUrlWithFallback } from '../utils/imageUtils';
import { orderService } from '../services/orderService';
import environment from '../config/environment';
import { useOrders } from '../hooks/queries/useOrders';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import BranchSwitcher from '../components/common/BranchSwitcher';

const { Header, Content } = Layout;
const { Meta } = Card;
const { Text } = Typography;

const CashierLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isOrdering, setIsOrdering] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isRevenueModalVisible, setIsRevenueModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Branch selection state
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    const storedBranchId = environment.multiTenant.getCurrentBranchId();
    console.log('🏢 Initial Branch ID from Storage:', storedBranchId);
    return storedBranchId;
  });

  // Fetch available branches
  const { data: branches, isLoading: isBranchesLoading } = usePublicBranchesOnly();

  // Get current branch
  const { data: currentBranch } = usePublicCurrentBranchOnly();

  // Branch switch hook
  const switchBranch = usePublicSwitchBranchOnly();

  // Order list query filtered by userId
  const {
    orders,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useOrders(selectedBranchId, {
    startOrderDate: deliveryDate,
    endOrderDate: deliveryDate,
    userId: user?.id, // Filter by userId
  });

  // Menu fetching with branch context
  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useMenus({
    date: deliveryDate,
    branchId: selectedBranchId
  });

  // Handle window resize to toggle mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to set initial branch
  useEffect(() => {
    const initializeBranch = async () => {
      try {
        console.group('🏢 Branch Initialization');
        console.log('Stored Branch ID:', selectedBranchId);
        console.log('Branches:', branches);
        console.log('Current Branch:', currentBranch);

        if (!selectedBranchId && branches && branches.length > 0) {
          const defaultBranch = await branchService.getDefaultBranch() || branches[0];
          if (defaultBranch) {
            const branchId = defaultBranch.id || defaultBranch.branchId;
            console.log('Setting Default Branch:', branchId);
            environment.multiTenant.setCurrentBranchId(branchId);
            setSelectedBranchId(branchId);
          }
        }
        console.groupEnd();
      } catch (error) {
        console.error('❌ Branch Initialization Error:', error);
        message.error('Không thể tải chi nhánh mặc định');
      }
    };

    initializeBranch();
  }, [branches]);

  // Handle branch selection
  const handleBranchChange = async (branchId) => {
    try {
      console.log('🔄 Switching Branch:', branchId);
      await switchBranch(branchId);
      environment.multiTenant.setCurrentBranchId(branchId);
      setSelectedBranchId(branchId);
      message.success(`Đã chuyển đến chi nhánh: ${branches.find(b => b.id === branchId)?.name || 'N/A'}`);
    } catch (error) {
      console.error('❌ Branch Switch Error:', error);
      message.error('Không thể chuyển chi nhánh');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('❌ CashierLayout logout failed:', error);
      navigate('/login');
    }
  };

  // Process menu data
  const processMenuData = (menuData) => {
    console.group('🍽️ Menu Data Processing');
    console.log('Raw Menu Data:', JSON.stringify(menuData, null, 2));

    try {
      if (!menuData) {
        console.warn('❌ Menu data is undefined');
        return [];
      }

      const foods = menuData.foods;
      if (!foods || !Array.isArray(foods)) {
        console.error('❌ Invalid foods data', { foods });
        return [];
      }

      const processedFoods = foods.map(food => {
        if (!food) {
          console.warn('⚠️ Skipping undefined food item');
          return null;
        }

        try {
          return {
            id: food.id || `food-${Math.random().toString(36).substr(2, 9)}`,
            name: food.name || 'Unnamed Dish',
            price: food.priceForGuest || 0,
            image: getImageUrlWithFallback(food.imageUrl, '/images/placeholder-food.png'),
            category: food.categoryId,
            quantity: 1,
            dishName: food.name || 'Unnamed Dish',
            FoodId: food.id,
            foodId: food.id,
            priceForGuest: food.priceForGuest || 0,
            priceForPatient: food.priceForPatient || food.priceForGuest || 0,
            priceForStaff: food.priceForStaff || food.priceForGuest || 0
          };
        } catch (itemError) {
          console.error('❌ Error processing food item:', {
            food,
            error: itemError.message
          });
          return null;
        }
      }).filter(Boolean);

      console.log('Processed Foods:', JSON.stringify(processedFoods, null, 2));
      console.groupEnd();
      return processedFoods;
    } catch (processingError) {
      console.error('🚨 Unexpected Menu Data Processing Error:', {
        error: processingError.message,
        stack: processingError.stack
      });
      console.groupEnd();
      return [];
    }
  };

  const foodItems = processMenuData(menuData);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    ...(menuData?.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name
    }))
  ];

  const filteredItems = selectedCategory === 'all' ? foodItems : foodItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const validItem = {
        id: item.id,
        FoodId: item.id,
        foodId: item.id,
        name: item.name || 'Unnamed Dish',
        dishName: item.name || 'Unnamed Dish',
        price: item.priceForGuest || item.price || 0,
        priceForGuest: item.priceForGuest || item.price || 0,
        priceForPatient: item.priceForPatient || item.priceForGuest || item.price || 0,
        priceForStaff: item.priceForStaff || item.priceForGuest || item.price || 0,
        image: item.image,
        category: item.category,
        quantity: 1
      };

      const existingItem = prevCart.find((cartItem) => cartItem.id === validItem.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === validItem.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, validItem];
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrder = async () => {
    if (!customerName.trim()) {
      message.error('Vui lòng nhập tên khách hàng');
      return;
    }

    if (!cart || cart.length === 0) {
      message.error('Vui lòng chọn món ăn');
      return;
    }

    const currentBranchId = environment.multiTenant.getCurrentBranchId();
    if (!currentBranchId) {
      message.error('Vui lòng chọn chi nhánh');
      return;
    }

    if (!user?.id) {
      message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    setIsOrdering(true);

    try {
      const orderData = {
        userId: user.id,
        customerName: customerName.trim(),
        receiveDate: deliveryDate,
        receiveTime: '12:00',
        receiveMethod: 'Giao tận nơi',
        total: getTotalPrice(),
        customerPhone: '0000000000',
        customerAddress: 'Tại căn teen',
        note: `Đơn hàng của ${customerName.trim()}`,
        includeUtensils: true,
        shippingFee: 0,
        paymentMethod: 'Cash', // Đảm bảo là Cash
        isPaid: true, // Cash orders are paid immediately
        locationId: null,
        cartItems: cart.map(item => ({
          FoodId: item.id,
          foodId: item.id,
          dishName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          note: null
        }))
      };

      console.log('🚀 Creating cashier order with data:', JSON.stringify(orderData, null, 2));

      // Sử dụng createOrderForCashier thay vì createOrder
      const response = await orderService.createOrderForCashier(orderData, currentBranchId);

      if (!response || !response.data) {
        throw new Error('Đơn hàng không được tạo thành công');
      }

      const createdOrder = response.data;
      const orderIdentifier = createdOrder.code || createdOrder.id || 'N/A';

      message.success(`Đặt hàng thành công! Mã đơn hàng: ${orderIdentifier}`);
      await refetchOrders();
      setCart([]);
      setCustomerName('');
      setDeliveryDate(dayjs().format('YYYY-MM-DD'));
    } catch (error) {
      console.error('❌ Cashier Order Creation Error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      message.error(error.message || 'Không thể đặt hàng. Vui lòng kiểm tra lại thông tin hoặc liên hệ hỗ trợ.');
    } finally {
      setIsOrdering(false);
    }
  };

  // Calculate total revenue
  const getTotalRevenue = () => {
    if (!orders || !Array.isArray(orders)) return 0;
    return orders.reduce((total, order) => total + (Number(order.total) || 0), 0);
  };

  // Table columns for order tracking
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      align: 'left',
      render: (code, record) => code || record.id,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      align: 'left',
      key: 'customerName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'left',
      render: (total) => (total != null ? total.toLocaleString('vi-VN') + 'đ' : 'N/A'),
    },
    {
      title: 'Món ăn',
      key: 'items',
      align: 'left',
      render: (_, record) => (
        <ul>
          {record.orderDetails?.map((item, index) => (
            <li key={index}>
              {item.foodName || item.dishName || 'Món ăn'} x {item.qty || item.quantity || 1} -
              {(item.total || (item.price * (item.qty || item.quantity || 1))).toLocaleString('vi-VN')}đ
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const headerStyle = {
    background: '#fff',
    padding: '0 16px',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    lineHeight: '64px',
    width: '100%',
  };

  const leftHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: '8px',
  };

  const rightHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={headerStyle}>
        <div style={leftHeaderStyle}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ marginRight: 8 }}
          />
          <BranchSwitcher />
        </div>
        <div style={rightHeaderStyle}>
          <UserHeader
            onLogout={handleLogout}
            style={{
              flexShrink: 0,
              gap: isMobile ? '8px' : '12px',
            }}
            greetingStyle={{
              fontSize: isMobile ? '12px' : '15px',
              color: '#666',
            }}
            avatarSize={isMobile ? 'small' : 'default'}
            showGreeting={!isMobile}
          />
        </div>
      </Header>
      <Content style={{ margin: '24px 16px 0' }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          padding: '16px',
          minHeight: 360
        }}>
          <style>{`
            .custom-button {
              border-color: #1890ff !important;
              color: #1890ff !important;
            }
            .custom-button:hover {
              border-color: #1890ff !important;
              color: #1890ff !important;
            }
          `}</style>
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto'
          }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
              <Col>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  color: '#333'
                }}>
                  Menu Món Ăn Việt Nam
                </h1>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => setIsOrderModalVisible(true)}
                    style={{
                      background: '#1890ff',
                      borderColor: '#1890ff',
                    }}
                  >
                    Theo dõi đơn hàng
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setIsRevenueModalVisible(true)}
                    style={{
                      background: '#1890ff',
                      borderColor: '#1890ff',
                    }}
                  >
                    Doanh thu
                  </Button>
                </Space>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={15}>
                <div style={{
                  display: 'flex',
                  overflowX: 'auto',
                  marginBottom: '16px',
                  gap: '8px',
                  padding: '0 8px'
                }}>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      style={{
                        background: selectedCategory === category.id ? '#1890ff' : 'white',
                        color: selectedCategory === category.id ? 'white' : 'black',
                        borderColor: '#d9d9d9',
                        minWidth: '100px',
                        textAlign: 'center',
                        padding: '10px 14px',
                        fontSize: '15px',
                        fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      onClick={() => addToCart(item)}
                      style={{
                        width: '100%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      cover={
                        <img
                          alt={item.name}
                          src={item.image}
                          style={{
                            height: '150px',
                            objectFit: 'cover'
                          }}
                        />
                      }
                    >
                      <Card.Meta
                        title={item.name}
                        description={`${item.price.toLocaleString('vi-VN')}đ`}
                        style={{
                          textAlign: 'center',
                          height: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      />
                    </Card>
                  ))}
                </div>
              </Col>

              <Col span={9}>
                <Card
                  title="Món ăn"
                  extra={
                    <Space align="center">
                      <div style={{ color: '#666' }}> Ngày giao hàng </div>
                      <DatePicker
                        value={deliveryDate ? dayjs(deliveryDate) : null}
                        onChange={(_, dateString) => setDeliveryDate(dateString)}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        format="DD/MM/YYYY"
                        style={{ width: '120px' }}
                      />
                    </Space>
                  }
                  style={{
                    width: '100%'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập tên khách hàng"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{
                    maxHeight: '600px',
                    overflowY: 'auto',
                    marginBottom: '16px'
                  }}>
                    {cart.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: '#888',
                        padding: '16px'
                      }}>
                        Chưa có món nào được chọn
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f5f5f5',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '12px',
                            gap: '16px'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              {item.name}
                            </h4>
                            <p style={{
                              color: '#1890ff',
                              fontSize: '14px',
                              margin: 0
                            }}>
                              {item.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          <Space>
                            <Button
                              size="small"
                              className="custom-button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                background: '#1890ff',
                                borderColor: '#1890ff',
                                color: 'white'
                              }}
                            >
                              +
                            </Button>
                          </Space>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{
                    borderTop: '1px solid #e8e8e8',
                    paddingTop: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        Tổng tiền
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1890ff'
                      }}>
                        {getTotalPrice().toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <Button
                      block
                      onClick={handleOrder}
                      disabled={!customerName.trim() || cart.length === 0}
                      loading={isOrdering}
                      style={{
                        height: '48px',
                        fontSize: '16px',
                        background: '#1890ff',
                        borderColor: '#1890ff',
                        color: 'white'
                      }}
                    >
                      Đặt hàng
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Order Tracking Modal */}
            <Modal
              title="Theo dõi đơn hàng"
              open={isOrderModalVisible}
              onCancel={() => setIsOrderModalVisible(false)}
              footer={null}
              width={1200}
              bodyStyle={{
                maxHeight: '700px',
                overflowY: 'auto',
                padding: '20px'
              }}
              style={{
                top: '5%'
              }}
            >
              {isOrdersLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '500px'
                }}>
                  <Spin
                    size="large"
                    tip="Đang tải danh sách đơn hàng..."
                  />
                </div>
              ) : ordersError ? (
                <div style={{
                  textAlign: 'center',
                  color: '#ff4d4f',
                  padding: '30px'
                }}>
                  Lỗi khi tải danh sách đơn hàng: {ordersError.message}
                </div>
              ) : (
                <Table
                  columns={orderColumns}
                  dataSource={orders}
                  rowKey="id"
                  pagination={{
                    pageSize: 15,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 15, 20, 50],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
                  }}
                  locale={{ emptyText: 'Không có đơn hàng nào' }}
                  scroll={{ y: 500 }}
                  size="large"
                />
              )}
            </Modal>

            {/* Revenue Tracking Modal */}
            <Modal
              title="Doanh thu"
              open={isRevenueModalVisible}
              onCancel={() => setIsRevenueModalVisible(false)}
              footer={null}
              width={800}
              bodyStyle={{
                backgroundColor: '#1890ff',
                color: '#fff',
                textAlign: 'center',
                padding: '40px',
                borderRadius: '12px'
              }}
              style={{
                top: '15%',
                backgroundColor: 'rgba(250, 140, 22, 0.1)'
              }}
              maskStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)'
              }}
            >
              {isOrdersLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '400px'
                }}>
                  <Spin
                    size="large"
                    tip="Đang tải dữ liệu doanh thu..."
                    style={{ color: '#fff' }}
                  />
                </div>
              ) : ordersError ? (
                <div style={{
                  textAlign: 'center',
                  color: '#fff'
                }}>
                  Lỗi khi tải dữ liệu doanh thu: {ordersError.message}
                </div>
              ) : (
                <div>
                  <Statistic
                    title={`Doanh thu ngày ${dayjs(deliveryDate).format('DD/MM/YYYY')}`}
                    value={getTotalRevenue()}
                    formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                    valueStyle={{
                      color: '#fff',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      marginBottom: '20px'
                    }}
                    titleStyle={{
                      color: '#fff',
                      fontSize: '24px',
                      marginBottom: '30px'
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '30px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        Tổng số đơn hàng
                      </p>
                    </div>
                    <div>
                      <p style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        {orders?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default CashierLayout;