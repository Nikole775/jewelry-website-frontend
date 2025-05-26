/*const LOCAL_STORAGE_KEY = 'jewelry_offline_queue';
const LOCAL_ITEMS_KEY = 'offline_local_items';

export function getQueue() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function queueOperation(op) {
    const queue = getQueue();
    queue.push(op);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queue));

    if (op.type === 'POST') {
        const localItems = JSON.parse(localStorage.getItem(LOCAL_ITEMS_KEY) || '[]');
        localItems.push({ ...op.data, id: `temp-${Date.now()}` });
        localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(localItems));
    }
}

export async function syncQueue(isOnline, serverAvailable) {
    if (!isOnline || !serverAvailable) return;

    const queue = getQueue();
    const remainingOps = [];
    const API_URL = "http://localhost:4000/items";

    for (let op of queue) {
        try {
            if (op.type === 'POST') {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(op.data),
                });
            }
        } catch (err) {
            remainingOps.push(op);
        }
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingOps));
    if (!remainingOps.some(op => op.type === 'POST')) {
        localStorage.removeItem(LOCAL_ITEMS_KEY);
    }
}

export function getLocalItems() {
    const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
}*/

const LOCAL_STORAGE_KEY = 'jewelry_offline_queue';
const LOCAL_ITEMS_KEY = 'offline_local_items';
const API_URL = "http://localhost:4000/api/products";

let syncTimeout;

export function getQueue() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function getLocalItems() {
    const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function queueOperation(op) {
    const queue = getQueue();
    queue.push(op);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queue));

    // Keep track of local items for offline UI rendering
    if (op.type === 'POST') {
        const localItems = getLocalItems();
        localItems.push({ ...op.data, id: `temp-${Date.now()}` });
        localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(localItems));
    }

    // Try syncing after queueing (debounced)
    triggerSync();
}

export function triggerSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncQueue(navigator.onLine), 1000);
}

export async function syncQueue(isOnline = navigator.onLine, serverAvailable = true) {
    if (!isOnline || !serverAvailable) return;

    const queue = getQueue();
    const remainingOps = [];

    for (let op of queue) {
        try {
            if (op.type === 'POST') {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(op.data),
                });

            } else if (op.type === 'PATCH') {
                await fetch(`${API_URL}/${op.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(op.data),
                });

            } else if (op.type === 'DELETE') {
                await fetch(`${API_URL}/${op.id}`, {
                    method: 'DELETE'
                });
            }

        } catch (err) {
            console.error("Sync failed for operation", op, err);
            remainingOps.push(op); // Retry later
        }
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingOps));

    // Clear temp local items only if no unsynced POSTs remain
    if (!remainingOps.some(op => op.type === 'POST')) {
        localStorage.removeItem(LOCAL_ITEMS_KEY);
    }
}
