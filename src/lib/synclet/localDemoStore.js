const USER_KEY = 'synclet.demo.user';
const CHANGE_KEY = 'synclet.demo.lastChange';
const CHANGE_EVENT = 'synclet:demo-change';

const DEFAULT_USER = {
  id: 'synclet-demo-user',
  full_name: "S'ne",
  display_name: "S'ne",
  email: 'sne@synclet.local',
  phone: '',
  role: 'admin',
  synclet_settings: { showSignalControls: false },
};

const migrateUser = (saved) => {
  const user = { ...DEFAULT_USER, ...saved };
  if (/^demo(?:\s|$)/i.test(user.display_name || '')) user.display_name = DEFAULT_USER.display_name;
  if (/^synclet\s+demo(?:\s+user)?$/i.test(user.full_name || '')) user.full_name = DEFAULT_USER.full_name;
  if (user.email === 'demo@synclet.local') user.email = DEFAULT_USER.email;
  const settings = { ...(user.synclet_settings || {}) };
  if (settings.showSignalControls === undefined) settings.showSignalControls = false;
  delete settings.demoMode;
  user.synclet_settings = settings;
  return user;
};

const COLLECTIONS = {
  Incident: 'synclet.demo.incidents',
  EmergencyContact: 'synclet.demo.contacts',
  AuditLog: 'synclet.demo.auditLogs',
  Task: 'synclet.demo.tasks',
};

const readUser = () => {
  const saved = localStorage.getItem(USER_KEY);
  if (saved) {
    try {
      const user = migrateUser(JSON.parse(saved));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }

  localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
  return { ...DEFAULT_USER };
};

const readCollection = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeCollection = (key, records) => {
  localStorage.setItem(key, JSON.stringify(records));
};

const matches = (record, where = {}) =>
  Object.entries(where).every(([key, value]) => record[key] === value);

const sortRecords = (records, sortBy) => {
  if (!sortBy) return records;
  const descending = sortBy.startsWith('-');
  const key = descending ? sortBy.slice(1) : sortBy;

  return records.sort((a, b) => {
    const left = a[key] ?? '';
    const right = b[key] ?? '';
    const comparison = left < right ? -1 : left > right ? 1 : 0;
    return descending ? -comparison : comparison;
  });
};

const applyLimit = (records, limit) =>
  Number.isFinite(limit) ? records.slice(0, Math.max(0, limit)) : records;

const publish = (collection, event) => {
  const detail = { collection, event, nonce: `${Date.now()}-${Math.random()}` };
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }));
  try {
    localStorage.setItem(CHANGE_KEY, JSON.stringify(detail));
  } catch {
    // The saved collection is still available in this tab if event mirroring fails.
  }
};

const createEntity = (name, key) => ({
  async list(sortBy, limit) {
    return applyLimit(sortRecords(readCollection(key), sortBy), limit);
  },

  async filter(where = {}, sortBy, limit) {
    const records = readCollection(key).filter((record) => matches(record, where));
    return applyLimit(sortRecords(records, sortBy), limit);
  },

  async create(values) {
    const now = new Date().toISOString();
    const record = {
      ...values,
      id: values.id || globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      created_by_id: values.created_by_id || readUser().id,
      created_date: values.created_date || now,
      updated_date: now,
    };
    writeCollection(key, [record, ...readCollection(key)]);
    publish(name, { type: 'create', id: record.id, data: record });
    return record;
  },

  async update(id, patch) {
    const records = readCollection(key);
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) throw new Error(`${name} record not found: ${id}`);

    const record = { ...records[index], ...patch, id, updated_date: new Date().toISOString() };
    records[index] = record;
    writeCollection(key, records);
    publish(name, { type: 'update', id, data: record });
    return record;
  },

  async delete(id) {
    const records = readCollection(key);
    const record = records.find((item) => item.id === id);
    writeCollection(key, records.filter((item) => item.id !== id));
    if (record) publish(name, { type: 'delete', id, data: record });
    return record;
  },

  async deleteMany(where = {}) {
    const records = readCollection(key);
    const removed = records.filter((record) => matches(record, where));
    writeCollection(key, records.filter((record) => !matches(record, where)));
    removed.forEach((record) => publish(name, { type: 'delete', id: record.id, data: record }));
    return removed.length;
  },

  subscribe(callback) {
    const onCustomChange = (event) => {
      if (event.detail?.collection === name) callback(event.detail.event);
    };
    const onStorageChange = (event) => {
      if (event.key !== CHANGE_KEY || !event.newValue) return;
      try {
        const detail = JSON.parse(event.newValue);
        if (detail.collection === name) callback(detail.event);
      } catch {
        // Ignore malformed cross-tab notifications; the next query refetch reads storage.
      }
    };

    window.addEventListener(CHANGE_EVENT, onCustomChange);
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustomChange);
      window.removeEventListener('storage', onStorageChange);
    };
  },
});

const entities = Object.fromEntries(
  Object.entries(COLLECTIONS).map(([name, key]) => [name, createEntity(name, key)]),
);

export const base44 = {
  entities,
  auth: {
    async me() {
      return readUser();
    },
    async updateMe(patch) {
      const user = { ...readUser(), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },
    logout() {
      window.location.assign('/app');
    },
  },
};
