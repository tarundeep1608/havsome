import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  X,
  Search,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { subscribeToMenu } from '../services/menuService';
import { createOrder } from '../services/orderService';
import { formatCurrency, MENU_CATEGORIES } from '../utils/formatters';

const TAX_RATE = 0.05;

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.item.id}_${action.item.selectedSize || 'default'}`;
      const existing = state.find((entry) => entry.cartKey === key);
      if (existing) {
        return state.map((entry) =>
          entry.cartKey === key ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...state, { ...action.item, cartKey: key, qty: 1 }];
    }
    case 'REMOVE': {
      const existing = state.find((entry) => entry.cartKey === action.cartKey);
      if (!existing) return state;
      if (existing.qty > 1) {
        return state.map((entry) =>
          entry.cartKey === action.cartKey
            ? { ...entry, qty: entry.qty - 1 }
            : entry
        );
      }
      return state.filter((entry) => entry.cartKey !== action.cartKey);
    }
    case 'DELETE':
      return state.filter((entry) => entry.cartKey !== action.cartKey);
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
  const [filterType, setFilterType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const categoryRefs = useRef({});

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      setMenuItems(items.filter((item) => item.isAvailable));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const groupedMenu = useMemo(
    () =>
      MENU_CATEGORIES.reduce((acc, category) => {
        let items = menuItems.filter((item) => item.category === category);

        if (filterType === 'veg') {
          items = items.filter((item) => item.type === 'veg');
        }
        if (filterType === 'non-veg') {
          items = items.filter((item) => item.type === 'non-veg');
        }
        if (searchQuery.trim()) {
          items = items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (items.length > 0) {
          acc[category] = items;
        }
        return acc;
      }, {}),
    [menuItems, filterType, searchQuery]
  );

  const activeCategories = useMemo(() => Object.keys(groupedMenu), [groupedMenu]);

  useEffect(() => {
    if (!activeCategory && activeCategories.length > 0) {
      setActiveCategory(activeCategories[0]);
    }
  }, [activeCategories, activeCategory]);

  useEffect(() => {
    if (activeCategories.length === 0) return undefined;

    const onScroll = () => {
      const marker = window.scrollY + 220;
      let current = activeCategories[0];
      activeCategories.forEach((category) => {
        const section = categoryRefs.current[category];
        if (section && section.offsetTop <= marker) {
          current = category;
        }
      });
      setActiveCategory((prev) => (prev === current ? prev : current));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeCategories]);

  const scrollToCategory = (category) => {
    const section = categoryRefs.current[category];
    if (!section) return;
    setActiveCategory(category);
    const y = section.getBoundingClientRect().top + window.scrollY - 205;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const addToCart = (item, size = null) => {
    dispatch({
      type: 'ADD',
      item: {
        ...item,
        selectedSize: size?.label || null,
        price: size?.price || item.price,
      },
    });
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = Math.round(cartSubtotal * TAX_RATE);
  const cartTotal = cartSubtotal + taxAmount;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        table: tableId || 'unknown',
        source: 'dine_in',
        status: 'pending',
        items: cart.map((item) => ({
          name: item.name + (item.selectedSize ? ` (${item.selectedSize})` : ''),
          qty: item.qty,
          price: item.price,
          menuItemId: item.id,
        })),
        subtotal: cartSubtotal,
        tax: taxAmount,
        total: cartTotal,
      };
      const result = await createOrder(payload);
      dispatch({ type: 'CLEAR' });
      setCartOpen(false);
      navigate(`/order/${result.orderId}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Unable to place order right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-3 w-24" />
                </div>
              </div>
              <div className="skeleton h-11 w-24 rounded-xl" />
            </div>
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="skeleton h-36 w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-4">
            <img src="/logo.png" alt="Havsome" className="h-12 w-12 rounded-xl shadow-sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-slate-900">Havsome</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                <MapPin size={14} className="text-primary-600" />
                Table {tableId}
              </p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-primary-50 hover:text-primary-700"
            >
              <ShoppingCart size={18} />
              <span className="ml-2">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search dishes, drinks, or desserts"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </label>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              {['all', 'veg', 'non-veg'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`min-h-11 rounded-lg px-4 text-sm font-semibold capitalize transition-all duration-200 hover:scale-[1.02] ${
                    filterType === type
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type === 'non-veg' ? 'Non-Veg' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[145px] z-30 border-b border-slate-200 bg-white/95 py-3 backdrop-blur md:top-[129px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {activeCategories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                  activeCategory === category
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        {activeCategories.length === 0 ? (
          <div className="flex min-h-[46vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 text-center">
            <Search size={42} className="mb-3 text-slate-400" />
            <p className="text-lg font-semibold text-slate-800">No menu items found</p>
            <p className="mt-1 text-sm text-slate-500">Try another search or filter combination.</p>
          </div>
        ) : (
          activeCategories.map((category) => (
            <section
              key={category}
              ref={(element) => {
                categoryRefs.current[category] = element;
              }}
              className="scroll-mt-[220px]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{category}</h2>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  {groupedMenu[category].length} items
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {groupedMenu[category].map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      cartItems={cart.filter((cartItem) => cartItem.id === item.id)}
                      onAdd={addToCart}
                      onRemove={(cartKey) => dispatch({ type: 'REMOVE', cartKey })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))
        )}
      </main>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:w-[360px]"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-primary-600 px-5 text-white shadow-lg shadow-primary-600/30 transition-all duration-200 hover:scale-[1.02] hover:bg-primary-700"
            >
              <span className="inline-flex items-center gap-3 text-sm font-semibold">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/20 px-1 text-sm font-bold">
                  {cartCount}
                </span>
                View Cart
              </span>
              <span className="text-base font-bold">{formatCurrency(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your Cart</h3>
                  <p className="text-xs text-slate-500">{cartCount} item(s)</p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-5">
                {cart.map((item) => (
                  <div key={item.cartKey} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 flex items-start gap-3">
                      <span
                        className={`mt-1 h-3 w-3 rounded-full ${
                          item.type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                          {item.selectedSize ? (
                            <span className="ml-1 text-xs font-medium text-slate-500">
                              ({item.selectedSize})
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm font-bold text-primary-700">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'DELETE', cartKey: item.cartKey })}
                        className="text-slate-400 transition-colors duration-200 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
                        <button
                          onClick={() => dispatch({ type: 'REMOVE', cartKey: item.cartKey })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-5">
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Taxes (5%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <span className="spinner !h-5 !w-5 !border-2 !border-white/25 !border-t-white" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItemCard({ item, cartItems, onAdd, onRemove }) {
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
  const imageUrl = item.imageUrl || item.image;
  const baseQty = cartItems.find((entry) => entry.selectedSize == null)?.qty || 0;
  const dietaryClass = item.type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500';
  const dietaryText = item.type === 'veg' ? 'Veg' : 'Non-Veg';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-700">
            <UtensilsCrossed size={30} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${dietaryClass}`} />
          {dietaryText}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {item.description || 'Chef special, prepared fresh and served hot.'}
          </p>
        </div>

        {!hasSizes && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-primary-700">{formatCurrency(item.price)}</p>

            {baseQty > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => onRemove(`${item.id}_default`)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-100"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-slate-900">{baseQty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(item)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-primary-700"
              >
                Add to Cart
              </button>
            )}
          </div>
        )}

        {hasSizes && (
          <div className="space-y-2">
            {item.sizes.map((size) => {
              const sizeKey = `${item.id}_${size.label}`;
              const sizeQty =
                cartItems.find((entry) => entry.selectedSize === size.label)?.qty || 0;

              return (
                <div
                  key={size.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{size.label}</p>
                    <p className="text-sm font-bold text-primary-700">{formatCurrency(size.price)}</p>
                  </div>

                  {sizeQty > 0 ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
                      <button
                        onClick={() => onRemove(sizeKey)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-slate-900">{sizeQty}</span>
                      <button
                        onClick={() => onAdd(item, size)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAdd(item, size)}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-primary-700"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}
