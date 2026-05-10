/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format order number with zero-padding (#001)
 */
export function formatOrderNumber(num) {
  return `#${String(num).padStart(3, '0')}`;
}

/**
 * Format time elapsed from a timestamp to human-readable string
 */
export function formatTimeElapsed(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const then = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Get time elapsed in minutes (for color coding)
 */
export function getMinutesElapsed(timestamp) {
  if (!timestamp) return 0;
  const then = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return Math.floor((Date.now() - then) / 60000);
}

/**
 * Get today's date string (YYYY-MM-DD) in IST
 */
export function getTodayDateKey() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status) {
  const map = {
    pending: 'badge-pending',
    in_kitchen: 'badge-kitchen',
    ready_to_serve: 'badge-ready',
    completed: 'badge-completed',
    rejected: 'badge-completed',
  };
  return map[status] || 'badge-completed';
}

/**
 * Get status display text
 */
export function getStatusText(status) {
  const map = {
    pending: 'Pending Approval',
    in_kitchen: 'In Kitchen',
    ready_to_serve: 'Ready to Serve',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return map[status] || status;
}

/**
 * Get source display text
 */
export function getSourceText(source) {
  const map = {
    dine_in: 'Dine In',
    walk_in: 'Walk-in',
    zomato: 'Zomato',
    swiggy: 'Swiggy',
  };
  return map[source] || source;
}

/**
 * Get order age CSS class for kitchen timer
 */
export function getOrderAgeClass(timestamp) {
  const mins = getMinutesElapsed(timestamp);
  if (mins >= 20) return 'order-age-red';
  if (mins >= 10) return 'order-age-yellow';
  return 'order-age-green';
}

/**
 * Menu categories in display order
 */
export const MENU_CATEGORIES = [
  'Pocket Pizzas',
  'Premium Pizzas (Veg)',
  'Premium Pizzas (Non-Veg)',
  'Garlic Bread',
  'Pasta',
  'Burgers (Veg)',
  'Burgers (Non-Veg)',
  'Wraps (Veg)',
  'Wraps (Non-Veg)',
  'Kurkure Momo',
  'Chicken Popcorn',
  'Sides',
  'Desserts',
  'Waffwich',
  'Ice Tea',
  'Mocktails',
  'Coffee',
  'Shakes',
  'Healthy Wraps',
  'Sandwiches',
  'Brown Rice Meals',
  'Salads',
  'Healthy Shakes',
];

/**
 * Order sources
 */
export const ORDER_SOURCES = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'zomato', label: 'Zomato' },
  { value: 'swiggy', label: 'Swiggy' },
];
