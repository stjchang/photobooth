const DB_NAME = "photobooth";
const DB_VERSION = 1;
const STORE_NAME = "photostrips";

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error("Failed to open database"));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true,
                });
                objectStore.createIndex("timestamp", "timestamp", { unique: false });
                objectStore.createIndex("createdAt", "createdAt", { unique: false });
                objectStore.createIndex("photoIndex", "photoIndex", { unique: false });
            }
        };
    });
}

export async function savePhoto(imageBlob, photoIndex, frameSrc, filter) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const photo = {
            imageData: imageBlob,
            photoIndex: photoIndex,
            frameSrc: frameSrc || null,
            filter: filter || "color",
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const request = store.add(photo);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error("Failed to save photo"));
            };
        });
    } catch (error) {
        throw new Error(`Error saving photo: ${error.message}`);
    }
}

export async function savePhotostrip(imageBlob, frameSrc, filter) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const photostrip = {
            imageData: imageBlob,
            photoIndex: null, // null indicates this is a full photostrip, not an individual photo
            frameSrc: frameSrc || null,
            filter: filter || "color",
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const request = store.add(photostrip);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error("Failed to save photostrip"));
            };
        });
    } catch (error) {
        throw new Error(`Error saving photostrip: ${error.message}`);
    }
}

export async function loadAllPhotos() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error("Failed to load photos"));
            };
        });
    } catch (error) {
        throw new Error(`Error loading photos: ${error.message}`);
    }
}

export async function clearAllPhotos() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error("Failed to clear photos"));
            };
        });
    } catch (error) {
        throw new Error(`Error clearing photos: ${error.message}`);
    }
}

export async function deletePhotostrip(id) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error("Failed to delete photostrip"));
            };
        });
    } catch (error) {
        throw new Error(`Error deleting photostrip: ${error.message}`);
    }
}

