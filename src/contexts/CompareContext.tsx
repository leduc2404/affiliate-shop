'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Product } from '@/types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const addToCompare = useCallback((product: Product): boolean => {
    let added = false;
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      if (prev.some(p => p.product_id === product.product_id)) {
        return prev;
      }
      added = true;
      return [...prev, product];
    });
    return added;
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(p => p.product_id !== productId));
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareList.some(p => p.product_id === productId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const openCompareModal = useCallback(() => {
    setIsCompareModalOpen(true);
  }, []);

  const closeCompareModal = useCallback(() => {
    setIsCompareModalOpen(false);
  }, []);

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      isCompareModalOpen,
      openCompareModal,
      closeCompareModal
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}
