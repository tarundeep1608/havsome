const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

/**
 * Get today's date key in IST (YYYY-MM-DD)
 */
function getTodayDateKey() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split("T")[0];
}

/**
 * Create Order - Callable Cloud Function
 * Atomically increments the daily counter and creates the order document.
 */
exports.createOrder = onCall(async (request) => {
  const data = request.data;

  // Validate required fields
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new HttpsError("invalid-argument", "Order must contain at least one item.");
  }

  if (!data.table) {
    throw new HttpsError("invalid-argument", "Table identifier is required.");
  }

  if (!data.source) {
    throw new HttpsError("invalid-argument", "Order source is required.");
  }

  const dateKey = getTodayDateKey();
  const counterRef = db.doc(`counters/daily_${dateKey}`);

  let orderNumber;
  let orderId;

  await db.runTransaction(async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    if (counterSnap.exists) {
      orderNumber = (counterSnap.data().current || 0) + 1;
      transaction.update(counterRef, { current: orderNumber });
    } else {
      orderNumber = 1;
      transaction.set(counterRef, { current: 1, date: dateKey });
    }

    const orderRef = db.collection("orders").doc();
    orderId = orderRef.id;

    transaction.set(orderRef, {
      orderNumber,
      table: data.table,
      source: data.source,
      status: data.status || "pending",
      items: data.items.map((item) => ({
        name: item.name || "",
        qty: Number(item.qty) || 1,
        price: Number(item.price) || 0,
        menuItemId: item.menuItemId || "",
      })),
      total: Number(data.total) || 0,
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: data.status === "in_kitchen" ? FieldValue.serverTimestamp() : null,
      completedAt: null,
    });
  });

  return { orderId, orderNumber };
});
