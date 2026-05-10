import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  Flame,
  Play,
  Sun,
  Moon,
  Check,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { subscribeToOrders, updateOrderStatus } from '../services/orderService';
import { useSound } from '../hooks/useSound';
import {
  formatOrderNumber,
  formatTimeElapsed,
  getMinutesElapsed,
  getSourceText,
} from '../utils/formatters';
import Toast from '../components/UI/Toast';

const KANBAN_COLUMNS = [
  {
    key: 'pending',
    title: 'New / Pending',
    subtitle: 'Action needed',
    border: 'border-rose-500',
    tint: 'bg-rose-500/10',
    actionLabel: 'Start Prep',
    nextStatus: 'in_kitchen',
    actionClass: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    key: 'in_kitchen',
    title: 'Preparing',
    subtitle: 'In progress',
    border: 'border-amber-500',
    tint: 'bg-amber-500/10',
    actionLabel: 'Mark Ready',
    nextStatus: 'ready_to_serve',
    actionClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    key: 'ready_to_serve',
    title: 'Ready',
    subtitle: 'Waiting pickup',
    border: 'border-emerald-500',
    tint: 'bg-emerald-500/10',
    actionLabel: 'Mark Served',
    nextStatus: 'completed',
    actionClass: 'bg-primary-600 hover:bg-primary-700',
  },
];

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [movingOrderId, setMovingOrderId] = useState('');
  const prevOrderCount = useRef(0);
  const { playNotification } = useSound();
  const { soundEnabled } = useOutletContext() || {};

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      ['pending', 'in_kitchen', 'ready_to_serve'],
      (incomingOrders) => {
        if (
          sessionStarted &&
          soundEnabled !== false &&
          incomingOrders.length > prevOrderCount.current &&
          prevOrderCount.current !== 0
        ) {
          playNotification();
        }
        prevOrderCount.current = incomingOrders.length;
        setOrders(incomingOrders);
      }
    );
    return () => unsubscribe();
  }, [playNotification, sessionStarted, soundEnabled]);

  const groupedOrders = useMemo(() => {
    const groups = {
      pending: [],
      in_kitchen: [],
      ready_to_serve: [],
    };
    orders.forEach((order) => {
      if (groups[order.status]) {
        groups[order.status].push(order);
      }
    });
    return groups;
  }, [orders]);

  const handleMoveOrder = async (orderId, nextStatus, message) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      setMovingOrderId(orderId);
      setToast({ message, type: 'success' });
      setTimeout(() => setMovingOrderId(''), 800);
    } catch (error) {
      console.error('Failed to move order:', error);
      setToast({ message: 'Unable to update order status', type: 'error' });
    }
  };

  if (!sessionStarted) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
          <ChefHat size={38} />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-900">Kitchen Display</h1>
        <p className="mb-7 max-w-md text-base text-slate-600">
          Start your KDS session to begin live tracking with urgent alerts and fast status updates.
        </p>
        <button
          onClick={() => {
            playNotification();
            setSessionStarted(true);
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-600 px-6 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-primary-700"
        >
          <Play size={20} />
          Start Session
        </button>
      </div>
    );
  }

  const boardShell = darkMode
    ? 'bg-slate-950 text-slate-100 border-slate-800'
    : 'bg-slate-100 text-slate-900 border-slate-200';

  const headerShell = darkMode
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const timestamp = new Date(now);

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${boardShell}`}>
      <div className={`sticky top-0 z-20 mb-4 rounded-2xl border px-4 py-3 ${headerShell}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
              <ChefHat size={22} />
            </div>
            <div>
              <p className="text-base font-bold">Kitchen Control Board</p>
              <p className="text-xs text-slate-500">
                {orders.length} active order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {timestamp.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <button
              onClick={() => setDarkMode((current) => !current)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors duration-200 ${
                darkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[980px] grid-cols-3 gap-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.key}
              darkMode={darkMode}
              column={column}
              orders={groupedOrders[column.key]}
              movingOrderId={movingOrderId}
              onMoveOrder={handleMoveOrder}
            />
          ))}
        </div>
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

function KanbanColumn({ column, orders, darkMode, movingOrderId, onMoveOrder }) {
  const shellClass = darkMode
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200';

  const listClass = darkMode ? 'text-slate-200' : 'text-slate-800';

  return (
    <section className={`rounded-2xl border ${shellClass} p-3`}>
      <div className={`mb-3 rounded-xl border-l-4 ${column.border} ${column.tint} px-3 py-2`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-bold ${listClass}`}>{column.title}</p>
            <p className="text-xs text-slate-500">{column.subtitle}</p>
          </div>
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700">
            {orders.length}
          </span>
        </div>
      </div>

      <div className="h-[calc(100vh-240px)] space-y-3 overflow-y-auto pr-1">
        <AnimatePresence>
          {orders.map((order) => (
            <KitchenTicket
              key={order.id}
              order={order}
              darkMode={darkMode}
              actionLabel={column.actionLabel}
              actionClass={column.actionClass}
              nextStatus={column.nextStatus}
              moving={movingOrderId === order.id}
              onMoveOrder={onMoveOrder}
            />
          ))}
        </AnimatePresence>

        {orders.length === 0 ? (
          <div
            className={`flex h-28 items-center justify-center rounded-xl border border-dashed text-sm ${
              darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'
            }`}
          >
            No orders here
          </div>
        ) : null}
      </div>
    </section>
  );
}

function KitchenTicket({
  order,
  darkMode,
  actionLabel,
  actionClass,
  nextStatus,
  moving,
  onMoveOrder,
}) {
  const minutes = getMinutesElapsed(order.approvedAt || order.createdAt);
  const isUrgent = minutes >= 15;
  const cardShell = darkMode
    ? 'bg-slate-800 border-slate-700 text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';

  const urgencyClass = isUrgent
    ? 'border-l-8 border-l-rose-500 animate-pulse'
    : minutes >= 8
      ? 'border-l-8 border-l-amber-500'
      : 'border-l-8 border-l-emerald-500';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      className={`rounded-xl border p-3 shadow-sm transition-all duration-300 ${cardShell} ${urgencyClass} ${
        moving ? 'ring-2 ring-primary-400' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-4xl font-black tracking-tight">{formatOrderNumber(order.orderNumber)}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{getSourceText(order.source)}</p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs font-bold text-primary-700">
            <MapPin size={12} />
            Table {order.table}
          </p>
          {isUrgent ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700">
              <Flame size={12} />
              Urgent
            </p>
          ) : null}
        </div>
      </div>

      <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1 text-sm font-bold text-amber-600">
        <Clock size={14} />
        {formatTimeElapsed(order.approvedAt || order.createdAt)}
      </div>

      <ul className="mb-4 space-y-2">
        {order.items?.map((item, index) => (
          <li key={index} className="rounded-lg bg-black/5 px-3 py-2 text-base font-semibold">
            <span className="mr-2 text-primary-700">{item.qty}x</span>
            {item.name}
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          onMoveOrder(
            order.id,
            nextStatus,
            nextStatus === 'completed' ? 'Order served successfully' : 'Order moved successfully'
          )
        }
        className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] ${actionClass}`}
      >
        {nextStatus === 'completed' ? <Check size={20} /> : <ArrowRight size={20} />}
        {actionLabel}
      </button>
    </motion.article>
  );
}
