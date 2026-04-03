import {
  initDB,
  getContacts,
  upsertContacts,
  getStats,
  getSettings as idbGetSettings,
  saveSettings as idbSaveSettings,
  clearAll,
} from "./idb";

export async function loadDatabase() {
  await initDB();
  const contacts = await getContacts();
  const stats = await getStats();
  return {
    contacts,
    lastUpdated: stats.lastUpdated,
    totalImports: stats.totalImports,
  };
}

export async function saveDatabase(db) {
  if (db.contacts && db.contacts.length > 0) {
    await upsertContacts(db.contacts);
  }
  return true;
}

export async function loadSettings() {
  await initDB();
  const s = await idbGetSettings();
  return {
    ownerName: s.ownerName || "",
    includeOwnerMessages: s.includeOwner || false,
  };
}

export async function saveSettings(settings) {
  await idbSaveSettings({
    ownerName: settings.ownerName,
    includeOwner: settings.includeOwnerMessages,
  });
  return true;
}

export async function clearDatabase() {
  await clearAll();
}

export function mergeContacts(existing, incoming) {
  const emailMap = new Map();

  for (const c of existing) {
    emailMap.set(c.email, c);
  }

  let newCount = 0;
  for (const c of incoming) {
    if (emailMap.has(c.email)) {
      const ex = emailMap.get(c.email);
      emailMap.set(c.email, { ...ex, merged: true });
    } else {
      emailMap.set(c.email, c);
      newCount++;
    }
  }

  return {
    contacts: [...emailMap.values()],
    newCount,
  };
}
