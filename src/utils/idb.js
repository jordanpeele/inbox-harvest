const DB_NAME = "inbox-harvest";
const DB_VERSION = 1;

let dbPromise = null;

export function initDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("contacts")) {
        const store = db.createObjectStore("contacts", { keyPath: "email" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("conversation", "conversation", { unique: false });
        store.createIndex("importedAt", "importedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function tx(storeName, mode = "readonly") {
  return initDB().then((db) => {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  });
}

function req(idbRequest) {
  return new Promise((resolve, reject) => {
    idbRequest.onsuccess = () => resolve(idbRequest.result);
    idbRequest.onerror = () => reject(idbRequest.error);
  });
}

export async function getContacts() {
  const store = await tx("contacts");
  return req(store.getAll());
}

export async function upsertContacts(contacts) {
  const db = await initDB();
  const transaction = db.transaction("contacts", "readwrite");
  const store = transaction.objectStore("contacts");

  let mergedCount = 0;

  for (const contact of contacts) {
    const existing = await req(store.get(contact.email));
    if (existing) {
      const differentConvo = existing.conversation !== contact.conversation;
      const shouldBeMerged = differentConvo || existing.merged || contact.merged;

      if (contact.timestamp < existing.timestamp) {
        store.put({ ...contact, merged: shouldBeMerged });
      } else {
        store.put({ ...existing, merged: shouldBeMerged });
      }
      if (differentConvo) mergedCount++;
    } else {
      store.put(contact);
    }
  }

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  const meta = await getMeta();
  await saveMeta({
    id: "stats",
    totalImports: (meta.totalImports || 0) + 1,
    lastUpdated: new Date().toISOString(),
    totalContacts: (await getContacts()).length,
  });

  return { mergedCount };
}

async function getMeta() {
  const store = await tx("meta");
  const result = await req(store.get("stats"));
  return result || { id: "stats", totalImports: 0, lastUpdated: null, totalContacts: 0 };
}

async function saveMeta(meta) {
  const store = await tx("meta", "readwrite");
  return req(store.put(meta));
}

export async function getStats() {
  const meta = await getMeta();
  const contacts = await getContacts();
  return {
    totalContacts: contacts.length,
    lastUpdated: meta.lastUpdated,
    totalImports: meta.totalImports || 0,
  };
}

export async function getSettings() {
  const store = await tx("settings");
  const result = await req(store.get("prefs"));
  return result || { id: "prefs", ownerName: "", includeOwner: false };
}

export async function saveSettings(settings) {
  const store = await tx("settings", "readwrite");
  return req(store.put({ ...settings, id: "prefs" }));
}

export async function clearAll() {
  const db = await initDB();
  const transaction = db.transaction(["contacts", "meta"], "readwrite");
  transaction.objectStore("contacts").clear();
  transaction.objectStore("meta").clear();
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function exportAll() {
  const contacts = await getContacts();
  const settings = await getSettings();
  const meta = await getMeta();
  return { contacts, settings, meta, exportedAt: new Date().toISOString() };
}

export async function importFromJSON(json) {
  if (!json.contacts || !Array.isArray(json.contacts)) {
    throw new Error("Invalid backup: missing contacts array");
  }

  const { mergedCount } = await upsertContacts(json.contacts);

  if (json.settings && json.settings.ownerName) {
    await saveSettings(json.settings);
  }

  return { imported: json.contacts.length, mergedCount };
}
