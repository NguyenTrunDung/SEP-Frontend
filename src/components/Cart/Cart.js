import React, { useState } from 'react';
import { Modal, Button, Typography, message, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTimezone } from '../../hooks/useTimezone';

const { Text } = Typography;

const CartModal = ({
  isCartModalVisible,
  setIsCartModalVisible,
  cartItems,
  setCartItems,
  setIsPaymentModalVisible,
  paymentDetails,
  setPaymentDetails,
  selectedBranch,
  handleCartUpdate,
}) => {
  const navigate = useNavigate();
  const { format } = useTimezone();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [cartId, setCartId] = useState(null);

  const handleRemoveCartItem = (cartId) => {
    const updatedItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedItems);
    message.success('Đã xóa món khỏi giỏ hàng.');
    handleCartUpdate();
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

    const newItem = {
      ...selectedMenuItem,
      quantity,
      cartId: cartId || uuidv4(),
      FoodId: selectedMenuItem.ID,
      note,
      BranchId: selectedBranch?.ID,
    };

    const updatedItems = cartId
      ? cartItems.map((item) => (item.cartId === cartId ? { ...item, quantity, note } : item))
      : [...cartItems, newItem];

    setCartItems(updatedItems);
    message.success(`${selectedMenuItem.dishName} đã được ${cartId ? 'cập nhật' : 'thêm'} vào giỏ hàng!`);
    setIsEditModalVisible(false);
    setIsCartModalVisible(true);
    setSelectedMenuItem(null);
    setQuantity(1);
    setNote('');
    setCartId(null);
    handleCartUpdate();
  };

  const handleGoToCart = () => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng của bạn đang trống.');
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const shippingFee = paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0;

    const validatedCartItems = cartItems.map((item) => ({
      FoodId: item.FoodId || item.ID,
      dishName: item.dishName || item.name || 'Unknown Dish',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      note: item.note || null,
      cartId: item.cartId,
    }));

    setPaymentDetails({
      ...paymentDetails,
      total,
      shippingFee,
      orderDetails: validatedCartItems.map((item) => `${item.dishName} x${item.quantity}`).join('\n'),
    });
    setIsCartModalVisible(false);
    setIsPaymentModalVisible(true);
  };

  return (
    <>
      <Modal
        open={isCartModalVisible}
        title={
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px',
              borderRadius: '4px 4px 0 0',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
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
          cartItems.length === 0 ? null : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '10px 0' }}>
              <Button
                onClick={() => {
                  setIsCartModalVisible(false);
                  navigate('/#menu');
                  setTimeout(() => {
                    const section = document.getElementById('menu');
                    if (section) {
                      const headerHeight = 139;
                      const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
                      window.scrollTo({ top: sectionPosition - headerHeight, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                style={{
                  backgroundColor: '#b4c80f',
                  color: '#000',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1,
                  maxWidth: '200px',
                }}
              >
                Thêm Món
              </Button>
              <Button
                type="primary"
                onClick={handleGoToCart}
                style={{
                  backgroundColor: '#b4c80f',
                  color: '#000',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1,
                  maxWidth: '200px',
                }}
              >
                Tiến Hành Đặt Món
              </Button>
            </div>
          )
        }
        width="min(90vw, 600px)"
        centered
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { padding: 0, borderRadius: '8px' },
          body: { padding: '16px', background: '#fff', maxHeight: '70vh', overflowY: 'auto' },
        }}
      >
        {cartItems.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>Giỏ hàng của bạn đang trống.</Text>
          </div>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid #ddd',
                  paddingBottom: '8px',
                  gap: '12px',
                }}
              >
                <img
                  src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                  alt={item.dishName || 'Unknown Dish'}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '14px' }}>{item.dishName || 'Unknown Dish'}</Text>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveCartItem(item.cartId)}
                        style={{
                          backgroundColor: '#ff4d4f',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCartItem(item.cartId)}
                        style={{
                          backgroundColor: '#b4c80f',
                          color: '#000',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    </div>
                  </div>
                  {item.note && (
                    <Text style={{ color: '#999', fontStyle: 'italic', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Ghi chú: {item.note}
                    </Text>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <Text style={{ fontSize: '14px' }}>
                      {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('vi-VN')} đ
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Button
                        style={{
                          backgroundColor: '#b4c80f',
                          color: '#000',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => {
                          const updatedItems = cartItems.map((cartItem) =>
                            cartItem.cartId === item.cartId
                              ? { ...cartItem, quantity: Math.max(1, Number(cartItem.quantity) - 1) }
                              : cartItem
                          );
                          setCartItems(updatedItems);
                          message.success(`${item.dishName} đã được cập nhật số lượng.`);
                          handleCartUpdate();
                        }}
                      >
                        -
                      </Button>
                      <span style={{ fontSize: '14px' }}>{item.quantity}</span>
                      <Button
                        style={{
                          backgroundColor: '#b4c80f',
                          color: '#000',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => {
                          const updatedItems = cartItems.map((cartItem) =>
                            cartItem.cartId === item.cartId
                              ? { ...cartItem, quantity: Number(cartItem.quantity) + 1 }
                              : cartItem
                          );
                          setCartItems(updatedItems);
                          message.success(`${item.dishName} đã được cập nhật số lượng.`);
                          handleCartUpdate();
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <Text strong style={{ fontSize: '16px' }}>Tạm tính:</Text>
              <Text style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                {cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0).toLocaleString('vi-VN')} đ
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
        width="min(90vw, 600px)"
        centered
        closeIcon={<span style={{ color: '#000', fontSize: '24px' }}>×</span>}
        styles={{
          content: { padding: 0, borderRadius: '8px' },
          body: { padding: 0 },
        }}
      >
        <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px 16px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            Cập nhật giỏ hàng
          </div>
          <img
            src={selectedMenuItem?.image || 'https://via.placeholder.com/600x250?text=No+Image'}
            alt={selectedMenuItem?.dishName || 'Unknown Dish'}
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{ padding: '16px' }}>
            <Text style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              {selectedMenuItem?.dishName || 'Không có tên'}
            </Text>
            <Text style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>
              {selectedMenuItem?.description || 'Không có mô tả'}
            </Text>
            <Text style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '12px' }}>
              {(Number(selectedMenuItem?.price) || 0).toLocaleString('vi-VN')} đ
            </Text>
            <Text style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              Ghi chú:
            </Text>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú..."
              style={{
                marginBottom: '16px',
                height: '100px',
                resize: 'none',
                fontSize: '14px',
              }}
            />
            <div style={{ textAlign: 'center', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <Button
                style={{
                  backgroundColor: '#b4c80f',
                  color: '#000',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span style={{ fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
              <Button
                style={{
                  backgroundColor: '#b4c80f',
                  color: '#000',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                padding: '12px',
                fontSize: '16px',
                borderRadius: '6px',
                fontWeight: '500',
              }}
              onClick={handleUpdateCart}
            >
              Cập Nhật Giỏ Hàng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CartModal;