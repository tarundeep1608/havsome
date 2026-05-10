import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getTodayDateKey } from '../utils/formatters';

const COLLECTION = 'orders';

/**
 * Create an order — direct Firestore write with atomic counter
 * Uses Cloud Functions only when deployed on Blaze plan
 */
export async function createOrder(orderData) {
  return await createOrderDirect(orderData);
}

/**
 * Direct Firestore order creation with atomic counter
 */
async function createOrderDirect(orderData) {
  const dateKey = getTodayDateKey();
  const counterRef = doc(db, 'counters', `daily_${dateKey}`);

  let orderNumber;
  let orderId;

  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    
    if (counterSnap.exists()) {
      orderNumber = (counterSnap.data().current || 0) + 1;
      transaction.update(counterRef, { current: orderNumber });
    } else {
      orderNumber = 1;
      transaction.set(counterRef, { current: 1, date: dateKey });
    }

    const orderRef = doc(collection(db, COLLECTION));
    orderId = orderRef.id;

    transaction.set(orderRef, {
      ...orderData,
      orderNumber,
      createdAt: serverTimestamp(),
      approvedAt: orderData.status === 'in_kitchen' ? serverTimestamp() : null,
      completedAt: null,
    });
  });

  return { orderId, orderNumber };
}

/**
 * Update order status with appropriate timestamps
 */
export async function updateOrderStatus(orderId, newStatus) {
  const docRef = doc(db, COLLECTION, orderId);
  const updateData = { status: newStatus };

  if (newStatus === 'in_kitchen') {
    updateData.approvedAt = serverTimestamp();
  } else if (newStatus === 'completed') {
    updateData.completedAt = serverTimestamp();
  } else if (newStatus === 'ready_to_serve') {
    updateData.readyAt = serverTimestamp();
  }

  await updateDoc(docRef, updateData);
}

/**
 * Subscribe to orders by status (real-time)
 */
export function subscribeToOrders(statusFilter, callback) {
  let q;

  if (Array.isArray(statusFilter)) {
    q = query(
      collection(db, COLLECTION),
      where('status', 'in', statusFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, COLLECTION),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'asc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders, snapshot);
  }, (error) => {
    console.error('Order subscription error:', error);
    callback([]);
  });
}

/**
 * Subscribe to today's orders (all statuses)
 */
export function subscribeToTodayOrders(callback) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const q = query(
    collection(db, COLLECTION),
    where('createdAt', '>=', startOfDay),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders);
  }, (error) => {
    console.error('Today orders subscription error:', error);
    callback([]);
  });
}

/**
 * Subscribe to a single order (for customer tracking)
 */
export function subscribeToOrder(orderId, callback) {
  const docRef = doc(db, COLLECTION, orderId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Single order subscription error:', error);
    callback(null);
  });
}
