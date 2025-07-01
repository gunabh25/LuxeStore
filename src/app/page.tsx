'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, easeInOut } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, X, Heart, Star, 
  Search, User, Zap, TrendingUp, Award, Eye
} from 'lucide-react';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  badge?: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Sample data with enhanced properties
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "AirPods Pro Max",
    price: 549.99,
    originalPrice: 599.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    rating: 4.8,
    reviews: 2847,
    description: "Wireless headphones with computational audio for immersive sound",
    inStock: true,
    isNew: true,
    badge: "Premium"
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Electronics",
    rating: 4.9,
    reviews: 1923,
    description: "The most rugged and capable Apple Watch, designed for adventure",
    inStock: true,
    isTrending: true,
    badge: "Bestseller"
  },
  {
    id: 3,
    name: "Smart Coffee Machine",
    price: 299.99,
    originalPrice: 349.99,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    category: "Home",
    rating: 4.6,
    reviews: 756,
    description: "AI-powered brewing with app control and custom recipes",
    inStock: false,
    badge: "Smart Home"
  },
  {
    id: 4,
    name: "Nike Air Zoom",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.7,
    reviews: 3241,
    description: "Revolutionary running shoes with responsive Zoom Air technology",
    inStock: true,
    isNew: true,
    isTrending: true
  },
  {
    id: 5,
    name: "Peak Design Backpack",
    price: 259.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.8,
    reviews: 892,
    description: "Professional camera backpack with modular organization",
    inStock: true,
    badge: "Pro Series"
  },
  {
    id: 6,
    name: "Bang & Olufsen Speaker",
    price: 499.99,
    originalPrice: 599.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Electronics",
    rating: 4.9,
    reviews: 1456,
    description: "Luxury wireless speaker with 360-degree sound and premium design",
    inStock: true,
    badge: "Luxury"
  },
  {
    id: 7,
    name: "MacBook Pro M3",
    price: 1999.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    category: "Electronics",
    rating: 4.9,
    reviews: 5632,
    description: "Supercharged by M3 chip for extraordinary performance",
    inStock: true,
    isNew: true,
    badge: "Latest"
  },
  {
    id: 8,
    name: "Designer Sunglasses",
    price: 299.99,
    originalPrice: 399.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.5,
    reviews: 423,
    description: "Polarized lenses with titanium frame and UV protection",
    inStock: true,
    isTrending: true
  }
];

const categories = ["All", "Electronics", "Fashion", "Home"];

// Enhanced Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { 
    y: 50, 
    opacity: 0,
    scale: 0.9,
    rotateX: -15
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
} as const;

const heroVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 20,
      duration: 1.2
    }
  }
};

const cartVariants = {
  hidden: { 
    x: "100%" as const, 
    opacity: 0,
    scale: 0.9
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: "100%" as const,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
} as const;

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: easeInOut
  }
};

const ShoppingApp: React.FC = () => {
  const [products] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-20"></div>
          
          <motion.div className="text-center">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-20 h-20 mx-auto mb-8 relative"
            >
              <div className="w-20 h-20 border-4 border-transparent border-t-purple-400 border-r-pink-400 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-transparent border-b-blue-400 border-l-cyan-400 rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Loading Amazing Products
            </motion.h2>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full max-w-xs mx-auto"
            />
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
          className="absolute top-40 right-20 w-32 h-32 bg-pink-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"
        />
      </div>

      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                LuxeStore
              </h1>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden md:flex flex-1 max-w-md mx-8"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search luxury products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all"
              >
                <User size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 bg-cyan-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
          >
            Luxury Redefined
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Discover premium products crafted for those who appreciate excellence
          </motion.p>
        </div>
      </motion.section>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/25'
                  : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {selectedCategory === category && (
                <motion.div
                  layoutId="categoryBg"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredProduct(product.id)}
                onHoverEnd={() => setHoveredProduct(null)}
                className="group relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col justify-between"
              >
                {/* Product Badges */}
                <div className="absolute top-4 left-4 z-20 space-y-2">
                  {product.isNew && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-block px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-black text-xs font-bold rounded-full"
                    >
                      NEW
                    </motion.span>
                  )}
                  {product.isTrending && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold rounded-full flex items-center gap-1"
                    >
                      <TrendingUp size={12} />
                      TRENDING
                    </motion.span>
                  )}
                  {product.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full"
                    >
                      {product.badge}
                    </motion.span>
                  )}
                </div>

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 z-20 p-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all"
                >
                  <Heart
                    size={20}
                    className={`transition-all ${
                      wishlist.includes(product.id)
                        ? 'text-red-400 fill-current'
                        : 'text-white'
                    }`}
                  />
                </motion.button>

                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Overlay on hover */}
                  <AnimatePresence>
                    {hoveredProduct === product.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4"
                      >
                        <motion.button
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-semibold hover:bg-white/30 transition-all"
                        >
                          <Eye size={16} />
                          Quick View
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through text-lg">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <span className="text-green-400 text-sm font-semibold">
                        Save ${(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button always at the bottom */}
                <div className="p-6 pt-0 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      product.inStock
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/25'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              variants={cartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Shopping Cart</h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCartOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-full transition-all"
                  >
                    <X size={24} className="text-white" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center py-20"
                    >
                      <motion.div
                        animate={floatingAnimation}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center"
                      >
                        <ShoppingCart size={40} className="text-gray-400" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                      <p className="text-gray-400 mb-6">Add some luxury items to get started</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCartOpen(false)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        Continue Shopping
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50, height: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-xl"
                            />

                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                            >
                              {item.quantity}
                            </motion.div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-lg mb-1 truncate">
                              {item.name}
                            </h4>
                            <p className="text-purple-300 font-bold text-xl">
                              ${item.price}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Total: ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-all"
                              >
                                <Minus size={16} className="text-white" />
                              </motion.button>
                              <span className="w-8 text-center text-white font-semibold">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-all"
                              >
                                <Plus size={16} className="text-white" />
                              </motion.button>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Cart Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: cart.length * 0.1 + 0.3 }}
                        className="border-t border-white/10 pt-6 mt-8 space-y-6"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-300">
                            <span>Subtotal ({getTotalItems()} items)</span>
                            <span>${getTotalPrice().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Shipping</span>
                            <span className="text-green-400">Free</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Tax</span>
                            <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-3">
                            <div className="flex justify-between items-center text-2xl font-bold text-white">
                              <span>Total</span>
                              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ${(getTotalPrice() + getTotalPrice() * 0.08).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl shadow-purple-500/25"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <Award size={20} />
                            Proceed to Checkout
                          </motion.div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsCartOpen(false)}
                          className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                        >
                          Continue Shopping
                        </motion.button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          animate={floatingAnimation}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl shadow-purple-500/25 flex items-center justify-center text-white hover:shadow-purple-500/40 transition-all"
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ↑
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="bg-black/20 backdrop-blur-xl border-t border-white/10 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4"
          >
            <Zap className="w-6 h-6 text-purple-400" />
            LuxeStore
          </motion.div>
          <p className="text-gray-400 text-lg">
            Premium products for exceptional people
          </p>
          <div className="mt-6 flex justify-center space-x-6">
            {['Privacy', 'Terms', 'Support', 'About'].map((link) => (
              <motion.a
                key={link}
                href="#"
                whileHover={{ scale: 1.1, color: '#a855f7' }}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ShoppingApp;