// IndexedDBラッパー for Bookmarklet履歴
// src/utils/bookmarkletHistoryDB.ts

export type BookmarkletHistoryItem = {
  id: string;
  title: string;
  code: string;
  bookmarkletCode: string;
  createdAt: number;
};

const DB_NAME = 'bookmarklet_history';
const STORE_NAME = 'bookmarklets';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addHistory(
  item: Omit<BookmarkletHistoryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const id = item.id || crypto.randomUUID();
  const createdAt = item.createdAt || Date.now();
  await new Promise<void>((resolve, reject) => {
    const req = store.put({ ...item, id, createdAt });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
  return id;
}

export async function getAllHistory(): Promise<BookmarkletHistoryItem[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const result: BookmarkletHistoryItem[] = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  // 新しい順
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteHistory(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await new Promise<void>((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
}
