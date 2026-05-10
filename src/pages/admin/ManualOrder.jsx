import { useState, useEffect, useReducer } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  Send,
  ShoppingCart,
  Search,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { subscribeToMenu } from '../../services/menuService';
import { createOrder } from '../../services/orderService';
import { formatCurrency, MENU_CATEGORIES, ORDER_SOURCES } from '../../utils/formatters';
import Toast from '../../components/UI/Toast';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = action.item.id;
      const existing = state.find((i) => i.id === key);
      if (existing) {
        return state.map((i) => (i.id === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE': {
      const existing = state.find((i) => i.id === action.id);
      if (existing && existing.qty > 1) {
        return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i));
      }
      return state.filter((i) => i.id !== action.id);
    }
    case 'DELETE':
      return state.filter((i) => i.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export default function ManualOrder() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [source, setSource] = useState('walk_in');
  const [tableNumber, setTableNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      setMenuItems(items.filter((i) => i.isAvailable));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const tableName =
        source === 'dine_in' || source === 'walk_in'
          ? tableNumber || 'Counter'
          : source.charAt(0).toUpperCase() + source.slice(1);

      const orderData = {
        table: tableName,
        source,
        status: 'in_kitchen', // Manual orders bypass pending
        items: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          menuItemId: item.id,
        })),
        total: cartTotal,
      };

      await createOrder(orderData);
      dispatch({ type: 'CLEAR' });
      setTableNumber('');
      setOrderComplete(true);
      setToast({ message: 'Order sent to kitchen!', type: 'success' });
      setTimeout(() => setOrderComplete(false), 3000);
    } catch (err) {
      console.error('Failed to create order:', err);
      setToast({ message: 'Failed to create order', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Unique categories present in menu
  const availableCategories = [...new Set(menuItems.map((i) => i.category))];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          New Order
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
          Manual order entry for walk-ins and aggregators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Menu Items */}
        <div className="lg:col-span-2">
          {/* Source & Table */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <label className="input-label">Order Source</label>
              <select
                className="select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {ORDER_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {(source === 'walk_in' || source === 'dine_in') && (
              <div className="flex-1 min-w-[120px]">
                <label className="input-label">Table Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-surface-500)' }} />
            <input
              type="text"
              className="input pl-10"
              placeholder="Quick search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={activeCategory === 'all'
                ? { background: 'var(--color-primary-500)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-surface-400)' }
              }
            >
              All Items
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={activeCategory === cat
                  ? { background: 'var(--color-primary-500)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-surface-400)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch({ type: 'ADD', item })}
                    className="glass-card p-3 text-left transition-all relative"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={item.type === 'veg' ? 'veg-indicator' : 'nonveg-indicator'}
                        style={{ marginTop: 2, width: 12, height: 12, borderWidth: 1.5 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-primary-400)' }}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    {inCart && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: 'var(--color-primary-500)', color: 'white' }}>
                        {inCart.qty}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4 sticky top-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <ShoppingCart size={16} />
              Order Cart
              {cart.length > 0 && (
                <span className="badge badge-kitchen">{cart.reduce((s, i) => s + i.qty, 0)}</span>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="empty-state py-8">
                <ShoppingCart size={32} />
                <p className="text-sm">Tap items to add</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[40vh] overflow-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 py-2"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-surface-500)' }}>
                          {formatCurrency(item.price)} × {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => dispatch({ type: 'REMOVE', id: item.id })}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => dispatch({ type: 'ADD', item })}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: 'var(--color-primary-500)' }}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'DELETE', id: item.id })}
                          className="w-6 h-6 rounded flex items-center justify-center ml-1"
                          style={{ color: 'var(--color-surface-500)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--color-primary-400)' }}>
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className="btn btn-success w-full"
                >
                  {submitting ? (
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  ) : (
                    <>
                      <Send size={16} />
                      Send to Kitchen
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {orderComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <CheckCircle size={80} style={{ color: '#22c55e', margin: '0 auto' }} />
            <p className="text-xl font-bold mt-4" style={{ fontFamily: 'var(--font-display)' }}>
              Order Sent!
            </p>
          </motion.div>
        </motion.div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
