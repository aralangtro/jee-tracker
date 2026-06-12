// ─────────────────────────────────────────────────────────────────
// IndexedDB Storage Layer — Data Durability Upgrade
// ─────────────────────────────────────────────────────────────────
// IndexedDB provides larger quotas (~50MB+) and survives browser
// data cleanup better than localStorage. This module transparently
// mirrors all writes to both IDB and localStorage (dual-write),
// and reads from IDB first with localStorage fallback.
// ─────────────────────────────────────────────────────────────────

const IDB = (() => {
  const DB_NAME = 'jee_tracker_db';
  const STORE_NAME = 'kv_store';
  const DB_VERSION = 1;
  let _db = null;
  let _ready = false;
  const _queue = [];  // operations queued before DB is ready

  /**
   * Open (or create) the IndexedDB database.
   * @returns {Promise<IDBDatabase>}
   */
  function open() {
    return new Promise((resolve, reject) => {
      if (_db) { resolve(_db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => {
        _db = e.target.result;
        _ready = true;
        resolve(_db);
      };
      req.onerror = (e) => {
        console.warn('[IDB] Failed to open IndexedDB:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  /**
   * Get a value from IndexedDB.
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async function get(key) {
    try {
      const db = await open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          const row = req.result;
          resolve(row ? row.value : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Set a value in IndexedDB.
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async function set(key, value) {
    try {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => {
          console.warn('[IDB] Write failed for key:', key, e.target.error);
          reject(e.target.error);
        };
      });
    } catch (e) {
      console.warn('[IDB] set() failed:', e);
    }
  }

  /**
   * Delete a key from IndexedDB.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async function remove(key) {
    try {
      const db = await open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }

  /**
   * Get all keys from IndexedDB.
   * @returns {Promise<string[]>}
   */
  async function keys() {
    try {
      const db = await open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Migrate all existing localStorage jt_* keys into IndexedDB.
   * Called once on first load.
   */
  async function migrateFromLocalStorage() {
    try {
      const db = await open();

      // Step 1: Read existing IDB keys in a separate transaction
      const existingKeys = new Set();
      await new Promise((resolve) => {
        const readTx = db.transaction(STORE_NAME, 'readonly');
        const readStore = readTx.objectStore(STORE_NAME);
        const req = readStore.getAllKeys();
        req.onsuccess = () => {
          (req.result || []).forEach(k => existingKeys.add(k));
          resolve();
        };
        req.onerror = () => resolve();
      });

      // Step 2: Collect all keys to migrate
      const toMigrate = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('jt_') && !key.includes('api_key') && !existingKeys.has(key)) {
          try {
            toMigrate.push({ key, value: JSON.parse(localStorage.getItem(key)) });
          } catch {
            toMigrate.push({ key, value: localStorage.getItem(key) });
          }
        }
      }

      // Also migrate jt_syl2 and jt_exam_settings if not already in IDB
      ['jt_syl2', 'jt_exam_settings'].forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw && !existingKeys.has(k)) {
          try { toMigrate.push({ key: k, value: JSON.parse(raw) }); }
          catch { toMigrate.push({ key: k, value: raw }); }
        }
      });

      if (toMigrate.length === 0) return 0;

      // Step 3: Write all in a single new transaction
      return new Promise((resolve) => {
        const writeTx = db.transaction(STORE_NAME, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_NAME);
        toMigrate.forEach(({ key, value }) => writeStore.put({ key, value }));
        writeTx.oncomplete = () => {
          console.log(`[IDB] Migrated ${toMigrate.length} keys from localStorage to IndexedDB`);
          resolve(toMigrate.length);
        };
        writeTx.onerror = () => resolve(0);
      });
    } catch (e) {
      console.warn('[IDB] Migration failed:', e);
      return 0;
    }
  }

  /**
   * Export all IDB data as a plain object.
   * @returns {Promise<Object>}
   */
  async function exportAll() {
    try {
      const db = await open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const result = {};
          (req.result || []).forEach(row => {
            result[row.key] = row.value;
          });
          resolve(result);
        };
        req.onerror = () => resolve({});
      });
    } catch {
      return {};
    }
  }

  /**
   * Import data from a plain object into IDB.
   * @param {Object} data — { key: value, ... }
   * @returns {Promise<number>} number of keys imported
   */
  async function importAll(data) {
    try {
      const db = await open();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        let count = 0;
        Object.entries(data).forEach(([key, value]) => {
          store.put({ key, value });
          count++;
        });
        tx.oncomplete = () => resolve(count);
        tx.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }

  /**
   * Check if IndexedDB is available.
   * @returns {boolean}
   */
  function isSupported() {
    try {
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
      return false;
    }
  }

  return { open, get, set, remove, keys, migrateFromLocalStorage, exportAll, importAll, isSupported };
})();

// ── Auto-initialize: open DB and defer migration ────────────────
if (IDB.isSupported()) {
  IDB.open().catch(e => console.warn('[IDB] open failed:', e));
  // Defer migration until after all scripts have loaded
  document.addEventListener('DOMContentLoaded', () => {
    IDB.migrateFromLocalStorage().catch(e => console.warn('[IDB] migration:', e));
  });
}
