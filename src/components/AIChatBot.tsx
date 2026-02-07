'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Ruler, Shirt, Package, Loader2, Search, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  productInfo?: {
    title: string;
    image: string;
    price: string;
  };
}

interface Product {
  title: string;
  image: string;
  price_low: string;
  price_high?: string;
  phan_loai: string;
  product_id: string;
}

const QUICK_PROMPTS = [
  { icon: Ruler, text: 'Tư vấn size', prompt: 'Tôi muốn được tư vấn size quần áo' },
  { icon: Shirt, text: 'Gợi ý phối đồ', prompt: 'Gợi ý phối đồ cho tôi' },
];

const FEATURE_HINTS = [
  '📏 Tư vấn size chuẩn theo số đo',
  '✨ Gợi ý phối đồ trendy',
  '📦 Hỏi về sản phẩm cụ thể',
];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Focus product search when modal opens
  useEffect(() => {
    if (showProductSearch) {
      setTimeout(() => productSearchRef.current?.focus(), 100);
      fetchProducts();
    }
  }, [showProductSearch]);

  // Show hints periodically when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length === 0) {
      const showTimer = setTimeout(() => setShowHints(true), 3000);
      const hideTimer = setTimeout(() => setShowHints(false), 8000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen, messages.length]);

  // Listen for openChatWithProduct event from ProductCard/ProductDetailModal
  useEffect(() => {
    const handleOpenChatWithProduct = (e: CustomEvent) => {
      const product = e.detail;
      if (product) {
        setIsOpen(true);
        const productInfo = {
          title: product.title,
          image: product.image,
          price: parseInt(product.price_low?.replace(/,/g, '') || '0').toLocaleString('vi-VN') + 'đ'
        };
        // Send message with product context
        setTimeout(() => {
          sendMessage('Tư vấn giúp tôi về sản phẩm này', productInfo);
        }, 300);
      }
    };

    window.addEventListener('openChatWithProduct', handleOpenChatWithProduct as EventListener);
    return () => {
      window.removeEventListener('openChatWithProduct', handleOpenChatWithProduct as EventListener);
    };
  }, []);

  const fetchProducts = async () => {
    if (products.length > 0) return; // Already fetched
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.phan_loai.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  const sendMessage = async (content: string, productInfo?: Message['productInfo']) => {
    if ((!content.trim() && !productInfo) || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: content.trim(),
      productInfo 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Format message content for API
      let apiContent = content;
      if (productInfo) {
        apiContent = `[Khách hàng gửi sản phẩm để hỏi]
        
📦 **Sản phẩm:** ${productInfo.title}
💰 **Giá:** ${productInfo.price}

${content || 'Tư vấn giúp tôi về sản phẩm này'}`;
      }

      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.productInfo 
          ? `[Sản phẩm: ${msg.productInfo.title} - Giá: ${msg.productInfo.price}] ${msg.content}`
          : msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.message 
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé! 😊' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    const productInfo = {
      title: product.title,
      image: product.image,
      price: product.price_high 
        ? `${product.price_low} - ${product.price_high}` 
        : product.price_low
    };
    setShowProductSearch(false);
    setProductSearch('');
    sendMessage('Tư vấn giúp tôi về sản phẩm này', productInfo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Hint Popup */}
        <AnimatePresence>
          {showHints && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-800">AI Stylist</span>
              </div>
              <div className="space-y-1.5">
                {FEATURE_HINTS.map((hint, i) => (
                  <div key={i} className="text-sm text-gray-600">{hint}</div>
                ))}
              </div>
              <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-100" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => !isOpen && setShowHints(true)}
          onMouseLeave={() => setShowHints(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-gray-800 text-white' 
              : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse animation when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Stylist</h3>
                  <p className="text-xs text-white/80">Tư vấn size & phối đồ trendy</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome message */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-800">Xin chào! 👋</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Mình là <strong>AI Stylist</strong> của Shop Deals! 💃
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>• 📏 Tư vấn size chuẩn</li>
                      <li>• ✨ Gợi ý phối đồ trendy</li>
                      <li>• 📦 Tư vấn về sản phẩm cụ thể</li>
                    </ul>
                  </div>

                  {/* Quick prompts */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Bạn cần gì?</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={i}
                            onClick={() => handleQuickPrompt(item.prompt)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {item.text}
                          </motion.button>
                        );
                      })}
                      <motion.button
                        onClick={() => setShowProductSearch(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm shadow-sm"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Gửi sản phẩm
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                      }`}
                    >
                      {/* Product card for user message */}
                      {msg.productInfo && (
                        <div className="p-2 border-b border-white/20">
                          <div className="flex gap-2 items-center">
                            <img 
                              src={msg.productInfo.image} 
                              alt={msg.productInfo.title}
                              className="w-12 h-12 rounded-lg object-cover bg-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{msg.productInfo.title}</p>
                              <p className="text-xs opacity-80">{msg.productInfo.price}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-3">
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-gray max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5 [&_strong]:text-orange-600 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                {/* Product button */}
                <motion.button
                  type="button"
                  onClick={() => setShowProductSearch(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                  title="Gửi sản phẩm"
                >
                  <Package className="w-4 h-4" />
                </motion.button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Search Modal */}
      <AnimatePresence>
        {showProductSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowProductSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Chọn sản phẩm</h3>
                <button 
                  onClick={() => setShowProductSearch(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={productSearchRef}
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              {/* Products list */}
              <div className="overflow-y-auto max-h-[50vh] p-2">
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {productSearch ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredProducts.map((product, i) => (
                      <motion.button
                        key={product.product_id || i}
                        onClick={() => handleProductSelect(product)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-orange-50 rounded-xl transition-colors text-left"
                      >
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-orange-600 font-semibold">{product.price_low}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{product.phan_loai}</span>
                          </div>
                        </div>
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
