const DB_NAME = 'TrafficEditorDB';
const DB_VERSION = 1;

export const STORES = {
  SCENE: 'scene',
  CUSTOM_ASSETS: 'custom_assets'
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.SCENE)) {
        db.createObjectStore(STORES.SCENE);
      }
      if (!db.objectStoreNames.contains(STORES.CUSTOM_ASSETS)) {
        db.createObjectStore(STORES.CUSTOM_ASSETS);
      }
    };
  });
};

export const saveToDB = async (storeName: string, key: string, data: any) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getFromDB = async (storeName: string, key: string) => {
  const db = await initDB();
  return new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
