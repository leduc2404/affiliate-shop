'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlist: Product[];
  isLoaded: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_KEY = 'shop-deals-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p.product_id === product.product_id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(p => p.product_id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.product_id === product.product_id);
      if (exists) {
        return prev.filter(p => p.product_id !== product.product_id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(p => p.product_id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      isLoaded,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
