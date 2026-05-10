import { useState, useEffect, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  X,
  Search,
  MapPin,
} from 'lucide-react';
import { subscribeToMenu } from '../services/menuService';
import { createOrder } from '../services/orderService';
import { formatCurrency, MENU_CATEGORIES } from '../utils/formatters';

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.item.id}_${action.item.selectedSize || 'default'}`;
      const existing = state.find((i) => i.cartKey === key);
      if (existing) {
        return state.map((i) =>
          i.cartKey === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.item, cartKey: key, qty: 1 }];
    }
    case 'REMOVE': {
      const existing = state.find((i) => i.cartKey === action.cartKey);
      if (existing && existing.qty > 1) {
        return state.map((i) =>
          i.cartKey === action.cartKey ? { ...i, qty: i.qty - 1 } : i
        );
      }
      return state.filter((i) => i.cartKey !== action.cartKey);
    }
    case 'DELETE':
      return state.filter((i) => i.cartKey !== action.cartKey);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, veg, non-veg
  const categoryRefs = useRef({});

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      // Only show available items
      setMenuItems(items.filter((i) => i.isAvailable));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Group items by category
  const groupedMenu = MENU_CATEGORIES.reduce((acc, category) => {
    let items = menuItems.filter((item) => item.category === category);
    
    // Apply type filter
    if (filterType === 'veg') items = items.filter((i) => i.type === 'veg');
    if (filterType === 'non-veg') items = items.filter((i) => i.type === 'non-veg');
    
    // Apply search filter
    if (searchQuery) {
      items = items.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (items.length > 0) acc[category] = items;
    return acc;
  }, {});

  const activeCategories = Object.keys(groupedMenu);

  // Scroll to category (adjusted for fixed header offset)
  const scrollToCategory = (category) => {
    setActiveCategory(category);
    const element = categoryRefs.current[category];
    if (element) {
      const headerOffset = 180; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const getItemQtyInCart = (itemId, size) => {
    const key = `${itemId}_${size || 'default'}`;
    return cart.find((i) => i.cartKey === key)?.qty || 0;
  };

  // Submit order
  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const orderData = {
        table: tableId || 'unknown',
        source: 'dine_in',
        status: 'pending',
        items: cart.map((item) => ({
          name: item.name + (item.selectedSize ? ` (${item.selectedSize})` : ''),
          qty: item.qty,
          price: item.price,
          menuItemId: item.id,
        })),
        total: cartTotal,
      };

      const result = await createOrder(orderData);
      dispatch({ type: 'CLEAR' });
      setCartOpen(false);
      navigate(`/order/${result.orderId}`);
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-surface-100">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src="/logo.png" alt="Havsome" className="w-20 h-20 rounded-2xl shadow-lg" 
        />
        <div className="spinner" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-surface-500)' }}>Loading fresh menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-surface-100">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong shadow-sm pb-1">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Havsome" className="w-12 h-12 rounded-xl shadow-sm" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
                Havsome
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} style={{ color: 'var(--color-primary-600)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-surface-600)' }}>
                  Table {tableId}
                </span>
              </div>
            </div>
            {/* Veg/Non-veg filter */}
            <div className="flex gap-1.5 bg-surface-200 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all`}
                style={filterType === 'all' ? { background: 'white', color: 'var(--color-primary-600)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } : { color: 'var(--color-surface-500)' }}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('veg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5`}
                style={filterType === 'veg' ? { background: 'white', color: 'var(--color-veg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } : { color: 'var(--color-surface-500)' }}
              >
                <span className="veg-indicator" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                Veg
              </button>
              <button
                onClick={() => setFilterType('non-veg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5`}
                style={filterType === 'non-veg' ? { background: 'white', color: 'var(--color-nonveg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } : { color: 'var(--color-surface-500)' }}
              >
                <span className="nonveg-indicator" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-surface-500)' }} />
            <input
              type="text"
              className="input pl-11 shadow-sm"
              placeholder="Search delicious dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '12px 16px 12px 44px', background: 'white', borderColor: 'var(--color-surface-200)' }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2.5 px-5 pb-3 overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: 'none' }}>
          {activeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={
                activeCategory === cat
                  ? { background: 'var(--color-primary-600)', color: 'white', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }
                  : { background: 'white', color: 'var(--color-surface-600)', border: '1px solid var(--color-surface-200)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Items */}
      <div className="px-5 py-4">
        {activeCategories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="empty-state py-24"
          >
            <Search size={48} style={{ color: 'var(--color-surface-300)' }} />
            <p className="text-lg font-bold text-surface-700">No items found</p>
            <p className="text-sm" style={{ color: 'var(--color-surface-500)' }}>Try a different search or filter</p>
          </motion.div>
        ) : (
          activeCategories.map((category) => (
            <div key={category} ref={(el) => (categoryRefs.current[category] = el)} className="mb-8 scroll-mt-[180px]">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4"
                style={{ color: 'var(--color-primary-600)', fontFamily: 'var(--font-display)' }}>
                {category}
              </h2>

              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {groupedMenu[category].map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      qtyInCart={getItemQtyInCart(item.id, item.sizes ? null : undefined)}
                      onAdd={(selectedItem) => dispatch({ type: 'ADD', item: selectedItem })}
                      onRemove={(cartKey) => dispatch({ type: 'REMOVE', cartKey })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-5 right-5 z-30"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="btn btn-primary w-full flex items-center justify-between"
              style={{ borderRadius: '20px', padding: '16px 24px', boxShadow: '0 8px 30px rgba(37, 99, 235, 0.4)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="font-bold text-white">{cartCount}</span>
                </div>
                <span className="font-semibold text-white">View Cart</span>
              </div>
              <span className="font-bold text-white text-lg">{formatCurrency(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-950/40 z-40"
              style={{ backdropFilter: 'blur(4px)' }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] max-h-[85vh] flex flex-col bg-white shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 rounded-full bg-surface-200" />
              </div>

              {/* Cart header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-surface-950)' }}>
                  Your Order
                </h2>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-auto px-6 pb-4">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-4 py-4"
                    style={{ borderBottom: '1px solid var(--color-surface-100)' }}>
                    <div className={item.type === 'veg' ? 'veg-indicator' : 'nonveg-indicator'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-surface-950 truncate">
                        {item.name}
                        {item.selectedSize && (
                          <span className="text-sm font-medium ml-1.5 text-surface-500">
                            ({item.selectedSize})
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-bold mt-0.5 text-primary-600">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch({ type: 'REMOVE', cartKey: item.cartKey })}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-base font-bold w-4 text-center text-surface-950">{item.qty}</span>
                      <button
                        onClick={() => dispatch({ type: 'ADD', item })}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'DELETE', cartKey: item.cartKey })}
                      className="p-2 ml-2 text-surface-400 hover:text-danger transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart footer */}
              <div className="p-6 bg-surface-50 rounded-t-[32px] border-t border-surface-200">
                <div className="flex justify-between mb-5 items-end">
                  <span className="text-base font-medium text-surface-500">Grand Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-success btn-lg w-full flex items-center justify-center gap-2"
                  style={{ borderRadius: '20px', padding: '18px 24px', fontSize: '18px' }}
                >
                  {submitting ? (
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
                  ) : (
                    <>
                      <Send size={20} />
                      Place Order Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Menu Item Component
function MenuItem({ item, qtyInCart, onAdd, onRemove }) {
  const [showSizes, setShowSizes] = useState(false);
  const hasSizes = item.sizes && item.sizes.length > 0;

  const handleAdd = (size = null) => {
    const selectedItem = {
      ...item,
      selectedSize: size?.label || null,
      price: size?.price || item.price,
    };
    onAdd(selectedItem);
    if (hasSizes) setShowSizes(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-4 flex gap-4"
    >
      <div className={item.type === 'veg' ? 'veg-indicator' : 'nonveg-indicator'} 
        style={{ marginTop: 4 }} />
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-surface-950">{item.name}</p>
        {item.description && (
          <p className="text-sm mt-1 line-clamp-2 text-surface-500 leading-relaxed">
            {item.description}
          </p>
        )}
        {!hasSizes && (
          <p className="text-base font-bold mt-2 text-primary-600">
            {formatCurrency(item.price)}
          </p>
        )}

        {/* Sizes */}
        {hasSizes && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.sizes.map((size) => (
              <button
                key={size.label}
                onClick={() => handleAdd(size)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all bg-surface-100 text-surface-700 hover:bg-surface-200 border border-surface-200"
              >
                {size.label} · <span className="text-primary-600">{formatCurrency(size.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      {!hasSizes && (
        <div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
          {qtyInCart > 0 ? (
            <div className="flex items-center gap-2 bg-surface-100 p-1 rounded-full border border-surface-200">
              <button
                onClick={() => onRemove(`${item.id}_default`)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-surface-700 shadow-sm"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold w-4 text-center text-surface-950">{qtyInCart}</span>
              <button
                onClick={() => handleAdd()}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-600 text-white shadow-sm"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAdd()}
              className="btn bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors w-full"
              style={{
                borderRadius: '14px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              ADD
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
