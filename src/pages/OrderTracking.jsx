import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Bell, ArrowLeft } from 'lucide-react';
import { subscribeToOrder } from '../services/orderService';
import { formatCurrency, formatOrderNumber, formatTime } from '../utils/formatters';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: '#eab308' },
  { key: 'in_kitchen', label: 'Being Prepared', icon: ChefHat, color: '#3b82f6' },
  { key: 'ready_to_serve', label: 'Ready to Serve', icon: Bell, color: '#22c55e' },
  { key: 'completed', label: 'Completed', icon: Check, color: '#6b7280' },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrder(orderId, (data) => {
      setOrder(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-surface-950)' }}>
        <div className="spinner" />
        <p className="text-sm" style={{ color: 'var(--color-surface-500)' }}>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ background: 'var(--color-surface-950)' }}>
        <p className="text-lg font-bold">Order not found</p>
        <p className="text-sm text-center" style={{ color: 'var(--color-surface-400)' }}>
          This order may have been removed or the link is invalid.
        </p>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isRejected = order.status === 'rejected';

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--color-surface-950)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Havsome" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Order {formatOrderNumber(order.orderNumber)}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-surface-400)' }}>
              Table {order.table} · {formatTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status */}
        {isRejected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 text-center mb-6"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <span className="text-2xl">✕</span>
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#f87171' }}>Order Rejected</h2>
            <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
              Unfortunately, your order could not be processed. Please try again or ask the staff.
            </p>
          </motion.div>
        ) : (
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-col gap-6">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    {/* Step circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
                      style={{
                        background: isCompleted ? `${step.color}20` : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${isCompleted ? step.color : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <Icon size={18} style={{ color: isCompleted ? step.color : 'var(--color-surface-600)' }} />
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ border: `2px solid ${step.color}` }}
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </div>

                    {/* Step text */}
                    <div>
                      <p className={`text-sm font-semibold ${isCompleted ? 'text-white' : ''}`}
                        style={!isCompleted ? { color: 'var(--color-surface-600)' } : undefined}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs mt-0.5" style={{ color: step.color }}>
                          Current status
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Order Summary
          </h3>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-2"
              style={{ borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div className="flex-1">
                <span className="text-sm">{item.name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--color-surface-500)' }}>×{item.qty}</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="font-bold">Total</span>
            <span className="font-bold" style={{ color: 'var(--color-primary-400)' }}>
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* Back link */}
        <Link
          to={`/menu/${order.table}`}
          className="btn btn-ghost w-full mt-4"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
