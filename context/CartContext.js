'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('lamiya_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('lamiya_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, qty = 1) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      const updated = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { ...product, quantity: qty }]);
    }
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter(item => item.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map(item => 
      item.id === productId ? { ...item, quantity: qty } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}