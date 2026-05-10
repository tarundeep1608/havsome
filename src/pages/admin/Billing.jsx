import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Check,
  DollarSign,
  Calendar,
  Filter,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { subscribeToTodayOrders, updateOrderStatus } from '../../services/orderService';
import {
  formatCurrency,
  formatOrderNumber,
  formatTime,
  getStatusBadgeClass,
  getStatusText,
  getSourceText,
} from '../../utils/formatters';
import Toast from '../../components/UI/Toast';

export default function Billing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToTodayOrders((allOrders) => {
      setOrders(allOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const handleMarkPaid = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'completed');
      setToast({ message: 'Marked as paid!', type: 'success' });
    } catch (err) {
      console.error('Mark paid failed:', err);
      setToast({ message: 'Failed to update', type: 'error' });
    }
  };

  // Stats
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingPayment = orders
    .filter((o) => o.status === 'ready_to_serve')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Billing</h1>
        <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
          Today&apos;s orders and payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <TrendingUp size={16} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-surface-500)' }}>
            Collected ({completedOrders.length} orders)
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
              <DollarSign size={16} style={{ color: '#eab308' }} />
            </div>
          </div>
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {formatCurrency(pendingPayment)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-surface-500)' }}>
            Pending Payment
          </p>
        </div>

        <div className="glass-card p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Receipt size={16} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {orders.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-surface-500)' }}>
            Total Orders Today
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { value: 'all', label: 'All' },
          { value: 'ready_to_serve', label: 'Ready (Unpaid)' },
          { value: 'completed', label: 'Paid' },
          { value: 'in_kitchen', label: 'In Kitchen' },
          { value: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              statusFilter === f.value
                ? { background: 'var(--color-primary-500)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-surface-400)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state py-16 glass-card">
          <Receipt size={48} />
          <p className="font-semibold">No orders found</p>
          <p className="text-sm">Orders will appear here as they are placed</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-4"
                style={{ borderRadius: '14px' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatOrderNumber(order.orderNumber)}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-primary-400)' }}>
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-surface-500)' }}>
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: 'var(--color-surface-400)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    Table {order.table}
                  </span>
                  <span>·</span>
                  <span>{getSourceText(order.source)}</span>
                </div>

                {/* Items */}
                <div className="text-xs space-y-0.5 mb-3" style={{ color: 'var(--color-surface-300)' }}>
                  {order.items?.map((item, i) => (
                    <span key={i}>
                      {item.qty}× {item.name}
                      {i < order.items.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>

                {/* Mark as paid button */}
                {order.status === 'ready_to_serve' && (
                  <button
                    onClick={() => handleMarkPaid(order.id)}
                    className="btn btn-success btn-sm w-full"
                  >
                    <Check size={14} />
                    Mark as Paid
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
