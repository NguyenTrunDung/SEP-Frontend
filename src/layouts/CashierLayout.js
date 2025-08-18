import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button, Input, Card, DatePicker, Spin, Row, Col, Space, Select, message, Image, Modal, Table, Statistic } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { useMenus } from '../hooks/queries/useMenuQueries'; 
import { usePublicBranchesOnly, usePublicCurrentBranchOnly, usePublicSwitchBranchOnly } from '../hooks/queries/useBranchSelector';
import { branchService } from '../services/branchService';
import { getImageUrlWithFallback, addCacheBusting } from '../utils/imageUtils';
import { orderService } from '../services/orderService';
import environment from '../config/environment';
import { useOrders } from '../hooks/queries/useOrders';

const { Meta } = Card;

const CashierLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isOrdering, setIsOrdering] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isRevenueModalVisible, setIsRevenueModalVisible] = useState(false);
  
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

  // Order list query
  const { 
    orders, 
    isLoading: isOrdersLoading, 
    error: ordersError, 
    refetch: refetchOrders 
  } = useOrders(selectedBranchId, {
    startOrderDate: deliveryDate,
    endOrderDate: deliveryDate
  });

  // Menu fetching with branch context
  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useMenus({ 
    date: deliveryDate, 
    branchId: selectedBranchId 
  });

  // Effect to set initial branch and log details
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
      console.log('Foods Array:', JSON.stringify(foods, null, 2));
      console.log('Foods Type:', typeof foods);
      console.log('Is Foods Array:', Array.isArray(foods));

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
      console.log('Processed Foods Count:', processedFoods.length);
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
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
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

    setIsOrdering(true);

    try {
      const orderData = {
        userId: null,
        customerName: customerName.trim(),
        receiveDate: deliveryDate,
        receiveTime: '12:00',
        receiveMethod: 'Giao tận nơi',
        total: getTotalPrice(),
        customerPhone: '0000000000',
        customerAddress: '',
        note: `Đơn hàng của ${customerName.trim()}`,
        includeUtensils: true,
        shippingFee: 0,
        paymentMethod: 1,
        isPaid: true,
        locationId: null,
        orderDetails: cart.reduce((details, item) => {
          if (item && item.id && item.name && item.price && item.quantity) {
            details.push({
              foodId: item.id,
              foodName: item.name,
              qty: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              note: null
            });
          }
          return details;
        }, [])
      };

      if (orderData.orderDetails.length === 0) {
        throw new Error('Không có mặt hàng hợp lệ để đặt hàng');
      }

      const createdOrder = await orderService.createOrder(orderData, currentBranchId);

      if (!createdOrder) {
        throw new Error('Đơn hàng không được tạo thành công');
      }

      message.success(`Đặt hàng thành công! Mã đơn hàng: ${createdOrder.code || createdOrder.id}`);
      await refetchOrders();
      setCart([]);
      setCustomerName('');
      setDeliveryDate(dayjs().format('YYYY-MM-DD'));
    } catch (error) {
      console.error('❌ Order Creation Error:', {
        message: error.message,
        stack: error.stack
      });
      message.error(error.message || 'Không thể đặt hàng. Vui lòng kiểm tra lại thông tin hoặc liên hệ hỗ trợ.');
    } finally {
      setIsOrdering(false);
    }
  };

  // Calculate total revenue
  const getTotalRevenue = () => {
    if (!orders || !Array.isArray(orders)) return 0;
    return orders.reduce((total, order) => total + (order.total || 0), 0);
  };

  // Table columns for order tracking
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => code || record.id,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => total.toLocaleString('vi-VN') + 'đ',
    },
    {
      title: 'Món ăn',
      key: 'items',
      render: (_, record) => (
        <ul>
          {record.orderDetails?.map((item, index) => (
            <li key={index}>
              {item.foodName} x {item.qty} - {(item.price * item.qty).toLocaleString('vi-VN')}đ
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '16px', 
      background: '#fff'
    }}>
      <style>{`
        .custom-button {
          border-color: #fa8c16 !important;
          color: #fa8c16 !important;
        }
        .custom-button:hover {
          border-color: #d46b08 !important;
          color: #d46b08 !important;
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
                  background: '#fa8c16',
                  borderColor: '#fa8c16',
                }}
              >
                Theo dõi đơn hàng
              </Button>
              <Button
                type="primary"
                onClick={() => setIsRevenueModalVisible(true)}
                style={{
                  background: '#fa8c16',
                  borderColor: '#fa8c16',
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
              marginBottom: '16px', // Restored original margin
              gap: '8px', // Restored original gap
              padding: '0 8px' 
            }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  style={{
                    background: selectedCategory === category.id ? '#fa8c16' : 'white',
                    color: selectedCategory === category.id ? 'white' : 'black',
                    borderColor: '#d9d9d9',
                    minWidth: '100px', // Slightly larger than original
                    textAlign: 'center', 
                    padding: '10px 14px', // Slightly increased padding
                    fontSize: '15px', // Slightly larger font
                    fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                    borderRadius: '6px', // Subtle rounding
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
                          color: '#fa8c16', 
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
                            background: '#fa8c16',
                            borderColor: '#fa8c16',
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
                    color: '#fa8c16' 
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
                    background: '#fa8c16',
                    borderColor: '#fa8c16',
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
          visible={isOrderModalVisible}
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
          visible={isRevenueModalVisible}
          onCancel={() => setIsRevenueModalVisible(false)}
          footer={null}
          width={800}
          bodyStyle={{ 
            backgroundColor: '#fa8c16', 
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
  );
};

export default CashierLayout;