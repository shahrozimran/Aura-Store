'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product: string; // Product ObjectId
  quantity: number;
  title: string;
  price: number;
  imageUrl: string;
  maxStock: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  tax: number;
  total: number;
  addToCart: (product: string, quantity: number, title: string, price: number, imageUrl: string, maxStock: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number, maxStock: number) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (
    productId: string,
    quantity: number,
    title: string,
    price: number,
    imageUrl: string,
    maxStock: number
  ): boolean => {
    let success = false;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product === productId);
      if (existingIndex > -1) {
        const newQty = prevCart[existingIndex].quantity + quantity;
        if (newQty > maxStock) {
          alert(`Cannot add more. Only ${maxStock} items available in stock.`);
          success = false;
          return prevCart;
        }
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQty
        };
        success = true;
        return newCart;
      } else {
        if (quantity > maxStock) {
          alert(`Cannot add. Only ${maxStock} items available in stock.`);
          success = false;
          return prevCart;
        }
        success = true;
        return [...prevCart, { product: productId, quantity, title, price, imageUrl, maxStock }];
      }
    });
    return success;
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number, maxStock: number): boolean => {
    if (quantity > maxStock) {
      alert(`Only ${maxStock} items available in stock.`);
      return false;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product === productId ? { ...item, quantity } : item
      )
    );
    return true;
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
