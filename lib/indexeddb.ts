const DB_NAME = 'AuraPOSDB';
const DB_VERSION = 1;

export interface OfflineOrder {
  localId: string;
  items: { product: string; quantity: number }[];
  paymentMethod: 'Cash' | 'Card' | 'Split';
  amountPaidCash: number;
  amountPaidCard: number;
  customerId?: string;
  locationId: string;
  registerSessionId: string;
  createdAt: string;
}

export function openPOSDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in browser environments'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('orders_queue')) {
        db.createObjectStore('orders_queue', { keyPath: 'localId' });
      }
    };
  });
}

export async function cacheProducts(products: any[]) {
  const db = await openPOSDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    store.clear();
    products.forEach((product) => store.put(product));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedProducts(): Promise<any[]> {
  const db = await openPOSDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineOrder(order: OfflineOrder) {
  const db = await openPOSDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('orders_queue', 'readwrite');
    const store = tx.objectStore('orders_queue');
    store.put(order);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedOrders(): Promise<OfflineOrder[]> {
  const db = await openPOSDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('orders_queue', 'readonly');
    const store = tx.objectStore('orders_queue');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedOrder(localId: string) {
  const db = await openPOSDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('orders_queue', 'readwrite');
    const store = tx.objectStore('orders_queue');
    store.delete(localId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
