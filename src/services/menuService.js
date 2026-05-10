import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'menu_items';

/**
 * Subscribe to all menu items in real-time
 */
export function subscribeToMenu(callback) {
  const q = query(
    collection(db, COLLECTION),
    orderBy('category')
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  }, (error) => {
    console.error('Menu subscription error:', error);
    callback([]);
  });
}

/**
 * Add a new menu item
 */
export async function addMenuItem(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Toggle item availability
 */
export async function toggleAvailability(id, isAvailable) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    isAvailable,
    updatedAt: serverTimestamp(),
  });
}
