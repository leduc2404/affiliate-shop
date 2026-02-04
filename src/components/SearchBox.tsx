'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface SearchBoxProps {
  products: { title: string; phan_loai: string }[];
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchBox({ products, onSearch, placeholder = "Tìm kiếm sản phẩm..." }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 150);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Trigger search
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Get popular categories as trending keywords
  const trendingKeywords = useMemo(() => {
    const catCount = new Map<string, number>();
    products.forEach(p => {
      if (p.phan_loai) {
        catCount.set(p.phan_loai, (catCount.get(p.phan_loai) || 0) + 1);
      }
    });
    return Array.from(catCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat]) => cat);
  }, [products]);

  // Generate suggestions - exact match on title
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const queryLower = query.toLowerCase().trim();
    const seen = new Set<string>();
    const results: string[] = [];

    for (const p of products) {
      if (results.length >= 5) break;
      if (!p.title) continue;
      
      const titleLower = p.title.toLowerCase();
      
      // Only include if title contains query
      if (titleLower.includes(queryLower)) {
        // Take first 45 chars of title
        const suggestion = p.title.length > 45 
          ? p.title.slice(0, 45).trim() + '...'
          : p.title;
        
        if (!seen.has(suggestion.toLowerCase())) {
          seen.add(suggestion.toLowerCase());
          results.push(suggestion);
        }
      }
    }

    return results;
  }, [query, products]);

  const handleSubmit = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
    
    setQuery(searchQuery);
    onSearch(searchQuery);
    setIsFocused(false);
    inputRef.current?.blur();
  }, [recentSearches, onSearch]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearQuery = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && (suggestions.length > 0 || (!query && (recentSearches.length > 0 || trendingKeywords.length > 0)));

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className={`relative flex items-center bg-white rounded-full border-2 transition-all duration-200 ${
        isFocused 
          ? 'border-red-400 shadow-lg shadow-red-500/20' 
          : 'border-red-200 hover:border-red-300'
      }`}>
        <Search className={`absolute left-4 w-5 h-5 transition-colors ${
          isFocused ? 'text-red-500' : 'text-gray-400'
        }`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3.5 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
        />
        
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 p-1.5 rounded-full hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400">
                <Clock className="w-3 h-3" />
                Gần đây
              </div>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending categories */}
          {!query && trendingKeywords.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 px-1 py-1.5 text-xs font-medium text-gray-400">
                <TrendingUp className="w-3 h-3" />
                Danh mục phổ biến
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {trendingKeywords.map((keyword, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(keyword)}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 text-xs font-medium rounded-full transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
