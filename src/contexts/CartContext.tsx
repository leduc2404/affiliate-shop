'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isLoaded: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'shop-deals-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.product_id === product.product_id);
      if (existing) {
        return prev.map(p => 
          p.product_id === product.product_id 
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(p => p.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(p => p.product_id !== productId));
      return;
    }
    setCart(prev => prev.map(p => 
      p.product_id === productId ? { ...p, quantity } : p
    ));
  }, []);

  const isInCart = useCallback((productId: string) => {
    return cart.some(p => p.product_id === productId);
  }, [cart]);

  const getCartItem = useCallback((productId: string) => {
    return cart.find(p => p.product_id === productId);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    const price = parseInt(item.price_low?.replace(/,/g, '').replace(/\./g, '') || '0');
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      isLoaded,
      addToCart,
      removeFromCart,
      updateQuantity,
      isInCart,
      getCartItem,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
