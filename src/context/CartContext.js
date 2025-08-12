import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loaded cart from localStorage:', parsedCart);
      setCartItems(parsedCart);
    }
  }, []);

  // Save cart to localStorage when cartItems changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to edit a cart item
  const editCartItem = (cartId, updatedItem, callback) => {
    const updatedItems = cartItems.map((item) =>
      item.cartId === cartId ? { ...item, ...updatedItem } : item
    );
    setCartItems(updatedItems);
    console.log('Updated cart item:', updatedItems);
    if (callback) callback();
  };

  // Function to clear cart (can be called from AuthContext)
  const clearCart = () => {
    console.log('🛒 Clearing cart');
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, editCartItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};