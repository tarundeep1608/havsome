import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  ChefHat,
  MapPin,
  Flame,
  Play
} from 'lucide-react';
import { subscribeToOrders, updateOrderStatus } from '../services/orderService';
import { useSound } from '../hooks/useSound';
import {
  formatOrderNumber,
  formatTimeElapsed,
  getMinutesElapsed,
  getOrderAgeClass,
  getSourceText,
} from '../utils/formatters';
import Toast from '../components/UI/Toast';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const prevOrderCount = useRef(0);
  const { playNotification } = useSound();
  const { soundEnabled } = useOutletContext() || {};

  useEffect(() => {
    // Only subscribe to orders if session is started, or we just load them but don't play sound yet
    const unsubscribe = subscribeToOrders('in_kitchen', (newOrders) => {
      if (
        sessionStarted &&
        soundEnabled !== false &&
        newOrders.length > prevOrderCount.current &&
        prevOrderCount.current !== 0
      ) {
        playNotification();
      }
      prevOrderCount.current = newOrders.length;
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, [playNotification, soundEnabled, sessionStarted]);

  // Force re-render every minute for timer updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkDone = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ready_to_serve');
      setToast({ message: 'Order marked ready!', type: 'success' });
    } catch (err) {
      console.error('Mark done failed:', err);
      setToast({ message: 'Failed to update', type: 'error' });
    }
  };

  if (!sessionStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <ChefHat size={64} className="text-primary-500 mb-6" />
        <h1 className="text-3xl font-bold text-surface-950 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Kitchen Display
        </h1>
        <p className="text-surface-600 mb-8 max-w-sm text-lg">
          Start the session to enable real-time order tracking and audio notifications.
        </p>
        <button
          onClick={() => {
            playNotification(); // Play once to unlock AudioContext
            setSessionStarted(true);
          }}
          className="btn btn-primary btn-lg w-full max-w-sm"
        >
          <Play size={20} />
          Start Session
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <ChefHat size={24} className="text-primary-600" />
          <span className="text-xl font-bold text-surface-950">{orders.length} Active Order{orders.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-4 text-sm font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-surface-200">
          <span className="flex items-center gap-2 text-surface-700">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            {'<10m'}
          </span>
          <span className="flex items-center gap-2 text-surface-700">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            10-20m
          </span>
          <span className="flex items-center gap-2 text-surface-700">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
            {'20m+'}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state py-32 bg-white rounded-[32px] border border-surface-200 shadow-sm mt-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <ChefHat size={80} className="text-surface-300" />
          </motion.div>
          <p className="text-2xl font-bold mt-4 text-surface-900" style={{ fontFamily: 'var(--font-display)' }}>
            Kitchen is clear!
          </p>
          <p className="text-lg text-surface-500">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid-orders">
          <AnimatePresence>
            {orders.map((order, index) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                index={index}
                onMarkDone={handleMarkDone}
              />
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

function KitchenOrderCard({ order, index, onMarkDone }) {
  const minutes = getMinutesElapsed(order.approvedAt || order.createdAt);
  const ageClass = getOrderAgeClass(order.approvedAt || order.createdAt);
  const isUrgent = minutes >= 20;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 200, height: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card p-5 ${ageClass} flex flex-col`}
      style={{ borderRadius: '24px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
            {formatOrderNumber(order.orderNumber)}
          </span>
          {isUrgent && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="bg-red-50 p-1.5 rounded-full"
            >
              <Flame size={24} className="text-[#ef4444]" />
            </motion.div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex items-center gap-1.5 font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
            <MapPin size={14} />
            <span>{order.table}</span>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-surface-100 text-surface-700 border border-surface-200">
            {getSourceText(order.source)}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 mb-5 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 w-fit"
        style={{
          color: minutes >= 20 ? '#ef4444' : minutes >= 10 ? '#f59e0b' : '#10b981',
        }}>
        <Clock size={16} />
        <span className="font-bold text-base">
          {formatTimeElapsed(order.approvedAt || order.createdAt)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-6 flex-1">
        {order.items?.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-surface-50 border border-surface-100"
          >
            <span className="text-xl font-black text-primary-600 min-w-[32px]">
              {item.qty}×
            </span>
            <span className="text-lg font-bold text-surface-900 flex-1">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Done button */}
      <motion.button
        onClick={() => onMarkDone(order.id)}
        className="btn btn-success w-full py-4 text-lg"
        whileTap={{ scale: 0.97 }}
      >
        <Check size={24} />
        Mark as Done
      </motion.button>
    </motion.div>
  );
}
