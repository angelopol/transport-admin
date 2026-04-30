export interface OfflinePayment {
    id?: number;
    bus_id: string;
    user_type: string;
    route_type: string;
    payment_method: string;
    amount: number;
    registered_at: string;
    reference_number: string;
    identification: string;
    phone_or_account: string;
    reference_image: File | null;
    timestamp: number;
}

const DB_NAME = 'transport_pwa_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_payments';

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
};

export const saveOfflinePayment = async (payment: Omit<OfflinePayment, 'id' | 'timestamp'>): Promise<number> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const dataToSave: OfflinePayment = {
            ...payment,
            timestamp: Date.now()
        };

        const request = store.add(dataToSave);
        
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
    });
};

export const getOfflinePayments = async (): Promise<OfflinePayment[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

export const deleteOfflinePayment = async (id: number): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
