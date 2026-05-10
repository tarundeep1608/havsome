import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Check,
  X,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  MapPin,
} from 'lucide-react';
import { subscribeToOrders, subscribeToTodayOrders, updateOrderStatus } from '../../services/orderService';
import { useSound } from '../../hooks/useSound';
import {
  formatCurrency,
  formatOrderNumber,
  formatTimeElapsed,
  formatTime,
  getSourceText,
} from '../../utils/formatters';
import Toast from '../../components/UI/Toast';

export default function Dashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const prevPendingCount = useRef(0);
  const { playNotification } = useSound();

  // Subscribe to pending orders
  useEffect(() => {
    const unsubscribe = subscribeToOrders('pending', (orders) => {
      // Play sound if new orders arrive
      if (orders.length > prevPendingCount.current && prevPendingCount.current !== 0) {
        playNotification();
      }
      prevPendingCount.current = orders.length;
      setPendingOrders(orders);
    });
    return () => unsubscribe();
  }, [playNotification]);

  // Subscribe to today's orders for stats
  useEffect(() => {
    const unsubscribe = subscribeToTodayOrders((orders) => {
      setTodayOrders(orders);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'in_kitchen');
      setToast({ message: 'Order sent to kitchen!', type: 'success' });
    } catch (err) {
      console.error('Approve failed:', err);
      setToast({ message: 'Failed to approve order', type: 'error' });
    }
  };

  const handleReject = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'rejected');
      setToast({ message: 'Order rejected', type: 'error' });
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  // Stats
  const stats = {
    totalOrders: todayOrders.length,
    pendingCount: pendingOrders.length,
    revenue: todayOrders
      .filter((o) => o.status !== 'rejected')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    inKitchen: todayOrders.filter((o) => o.status === 'in_kitchen').length,
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
          <p className="text-sm font-medium text-surface-500 mt-1">
            Real-time order management & analytics
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-surface-200 shadow-sm text-sm font-semibold text-surface-700">
          <Clock size={16} className="text-primary-600" />
          Live Status
          <span className="relative flex h-2.5 w-2.5 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.totalOrders}
          color="#3b82f6"
        />
        <StatCard
          icon={Clock}
          label="Pending Queue"
          value={stats.pendingCount}
          color="#f59e0b"
          urgent={stats.pendingCount > 0}
        />
        <StatCard
          icon={ChefHat}
          label="In Kitchen"
          value={stats.inKitchen}
          color="#10b981"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          color="#ea580c"
        />
      </div>

      {/* Pending Orders */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
          <Clock size={20} className="text-[#f59e0b]" />
          Approval Queue
          {stats.pendingCount > 0 && (
            <span className="ml-2 bg-[#fef3c7] text-[#b45309] border border-[#fde68a] px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
              {stats.pendingCount}
            </span>
          )}
        </h2>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="empty-state py-20 bg-white rounded-3xl border border-surface-200 shadow-sm">
          <Check size={56} className="text-surface-300" />
          <p className="font-bold text-xl text-surface-900 mt-2">All clear!</p>
          <p className="text-surface-500 font-medium">No pending orders to approve.</p>
        </div>
      ) : (
        <div className="grid-orders">
          <AnimatePresence>
            {pendingOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: 100 }}
                className="glass-card p-5"
                style={{ borderLeft: '6px solid var(--color-status-pending)' }}
              >
                {/* Order header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatOrderNumber(order.orderNumber)}
                    </span>
                    <span className="badge badge-pending shadow-sm">{getSourceText(order.source)}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md mb-1">
                      <MapPin size={12} />
                      Table {order.table}
                    </div>
                    <p className="text-[11px] font-medium text-surface-500">
                      {formatTimeElapsed(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 space-y-1.5 p-3 bg-surface-50 rounded-xl border border-surface-100">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm items-center">
                      <span className="font-semibold text-surface-800">
                        <span className="font-bold text-primary-600 w-5 inline-block">{item.qty}×</span>{' '}
                        {item.name}
                      </span>
                      <span className="font-medium text-surface-500">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Total & actions */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-200">
                  <span className="font-bold text-lg text-surface-950">
                    {formatCurrency(order.total)}
                  </span>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleReject(order.id)}
                      className="btn btn-ghost hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <X size={16} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="btn btn-success shadow-md"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, urgent }) {
  return (
    <div
      className={`glass-card p-5 ${urgent ? 'animate-pulse-glow' : ''}`}
      style={urgent ? { borderColor: color + '50' } : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: color + '15' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      <p className="text-sm font-semibold mt-1 text-surface-500">{label}</p>
    </div>
  );
}
