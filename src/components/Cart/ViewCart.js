import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Alert, Spin, Form, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api/config';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

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

  const columns = [
    {
      title: 'Dish Name',
      dataIndex: 'dishName',
      key: 'dishName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleRemoveItem(record.cartId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const handleRemoveItem = (cartId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
    message.success('Item removed from cart.');
  };

  const handleCheckout = async (values) => {
    if (cartItems.length === 0) {
      message.error('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);
      const userId = uuidv4(); // Generate guest user ID
      sessionStorage.setItem('guestUserId', userId);

      const orderData = {
        userId,
        name: values.name,
        phone: values.phone,
        items: cartItems.map((item) => ({
          foodId: item.FoodId,
          dishName: item.dishName,
          price: item.price,
          quantity: item.quantity,
          cartId: item.cartId,
        })),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };

      await api.post('/orders', orderData);
      message.success('Order placed successfully!');
      setCartItems([]); // Clear cart
      localStorage.removeItem('cartItems');
      form.resetFields();
      navigate('/'); // Redirect to home
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: 'auto' }}>
      <Title level={2}>Your Cart</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {loading ? (
        <Spin size="large" />
      ) : cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={cartItems}
            rowKey="cartId"
            pagination={false}
            style={{ marginBottom: 16 }}
          />
          <Text strong>Total: {totalAmount.toLocaleString('vi-VN')} VND</Text>
          <div style={{ marginTop: 24 }}>
            <Title level={4}>Checkout</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCheckout}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Enter your name" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' },
                ]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Place Order
                </Button>
              </Form.Item>
            </Form>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;