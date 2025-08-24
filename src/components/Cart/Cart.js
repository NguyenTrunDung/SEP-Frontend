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

    if (cartId) {
      const updatedItems = cartItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity, note } : item
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
        BranchId: selectedBranch?.ID,
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

  const handleGoToCart = () => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng của bạn đang trống.');
      return;
    }
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0;

    // Validate cart items have required properties for API
    const validatedCartItems = cartItems.map(item => ({
      ...item,
      FoodId: item.FoodId || item.ID,
      dishName: item.dishName || item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      note: item.note || null,
      cartId: item.cartId
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
                key="footer"
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
                    navigate('/#menu');
                    setTimeout(() => {
                      const section = document.getElementById('menu');
                      if (section) {
                        const headerHeight = 139;
                        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({
                          top: sectionPosition - headerHeight,
                          behavior: 'smooth',
                        });
                      }
                    }, 100);
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
                    marginRight: 16,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                  {item.note && (
                    <Text style={{
                      color: '#999',
                      fontStyle: 'italic',
                      display: 'block',
                      marginTop: 4,
                    }}>
                      Ghi chú: {item.note}
                    </Text>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}>
                    <Text>
                      {format.currency(item.price * item.quantity)} đ
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
                          handleCartUpdate();
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}>
              <Text strong style={{ color: 'black' }}>Tạm tính:</Text>
              <Text style={{ color: 'red' }}>
                {format.currency(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))} đ
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
        <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px 16px',
              fontSize: '18px',
            }}
          >
            Cập nhật giỏ hàng
          </div>
          <img
            src={selectedMenuItem?.image || 'https://via.placeholder.com/600x250?text=No+Image'}
            alt={selectedMenuItem?.dishName}
            style={{
              width: '100%',
              maxHeight: '250px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{ padding: '16px' }}>
            <Text
              style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px',
              }}
            >
              {selectedMenuItem?.dishName || 'Không có tên'}
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: '15px',
                color: '#555',
                marginBottom: '8px',
              }}
            >
              {selectedMenuItem?.description || 'Không có mô tả'}
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#ff0000',
                marginBottom: '8px',
              }}
            >
              {format.currency(selectedMenuItem?.price) || '0'} đ
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px',
              }}
            >
              Ghi chú:
            </Text>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú..."
              style={{
                marginBottom: '20px',
                height: '115px',
                resize: 'none',
              }}
            />
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