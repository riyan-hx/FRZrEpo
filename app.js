'use strict';

/* =========================================================
   Lumid HQ — CEO command center (vanilla JS, localStorage)
   ========================================================= */

const STORE_KEY = 'lumid-hq-v1';
const THEME_KEY = 'lumid-hq-theme';
const VENTURE_COLORS = ['#5e5ce6', '#30b0c7', '#ff9f0a', '#ff375f', '#0a84ff', '#30d158'];

const STAGES = [
  { id: 'spark', label: 'Spark', color: '#ff9f0a' },
  { id: 'exploring', label: 'Exploring', color: '#0a84ff' },
  { id: 'building', label: 'Building', color: '#5e5ce6' },
  { id: 'shipped', label: 'Shipped', color: '#30d158' },
  { id: 'parked', label: 'Parked', color: '#8e8e93' },
];
const PRIORITIES = [['p1', 'P1 · Critical'], ['p2', 'P2 · Important'], ['p3', 'P3 · Normal']];
const RES_STATUS = [['watch', 'To watch'], ['reference', 'Reference'], ['done', 'Watched']];
const EVENT_TYPES = [['meeting', 'Meeting'], ['focus', 'Focus block'], ['deadline', 'Deadline'], ['investor', 'Investor'], ['launch', 'Launch'], ['personal', 'Personal']];

/* ---------- Utilities ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => toISO(new Date());
const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const fmtDate = (iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => iso ? fromISO(iso).toLocaleDateString(undefined, opts) : '';
const relDate = (iso) => {
  if (!iso) return '';
  const diff = Math.round((fromISO(iso) - fromISO(today())) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff}d overdue`;
  if (diff < 7) return fmtDate(iso, { weekday: 'long' });
  return fmtDate(iso);
};
const fmtNum = (n) => Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.abs(n) >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : Number(n).toLocaleString();
const quarterOf = (d = new Date()) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;

const ICONS = {
  today: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  ideas: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
  tasks: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  notes: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  schedule: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  metrics: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  decisions: '<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8"/>',
  people: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-5-6.7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  resources: '<rect x="2" y="4" width="20" height="16" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  sparkle: '<path d="M12 2.5c.7 5 2.5 6.8 7.5 7.5-5 .7-6.8 2.5-7.5 7.5-.7-5-2.5-6.8-7.5-7.5 5-.7 6.8-2.5 7.5-7.5z" fill="currentColor" stroke="none"/>',
  coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  pin: '<path d="M12 17v5M9 3h6l-1 7 4 3v2H6v-2l4-3z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
};
const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
// iOS-style gradient tiles per section
const TILE_GRADIENTS = {
  today: ['#0a84ff', '#5e5ce6'], ideas: ['#ffd60a', '#ff9f0a'], tasks: ['#34c759', '#00c7be'],
  notes: ['#ffcc00', '#ff9500'], schedule: ['#ff6b5a', '#ff2d55'], resources: ['#ff375f', '#bf5af2'],
  goals: ['#7d7aff', '#5e5ce6'], metrics: ['#64d2ff', '#0a84ff'], decisions: ['#da8fff', '#af52de'],
  people: ['#63e6e2', '#30b0c7'], settings: ['#aeaeb2', '#636366'], bolt: ['#ff9f0a', '#ff375f'],
  bell: ['#ff9f0a', '#ff6b00'], sparkle: ['#a99bff', '#6a58f5'], pin: ['#ffd60a', '#ff9f0a'], coins: ['#63e6e2', '#0fb3a3'],
};
const appIcon = (name, size = '', glyph = name) => {
  const [, b] = TILE_GRADIENTS[name] || TILE_GRADIENTS.today;
  return `<span class="app-icon ${size}" style="--ic:${b}">${icon(glyph)}</span>`;
};
const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

/* ---------- Data ---------- */
const emptyDb = () => ({
  ventures: ['Lumid AI', 'Lumid Studio', 'General'],
  ideas: [], tasks: [], notes: [], events: [], goals: [], metrics: [], decisions: [], people: [], resources: [],
  plans: {},
});

function seed() {
  const db = emptyDb();
  const t = today();
  db.ideas = [
    { id: uid(), title: 'Voice-first assistant mode for Lumid AI', body: 'Let users talk to Lumid hands-free. Start with a push-to-talk prototype.', venture: 'Lumid AI', stage: 'exploring', impact: 5, effort: 3, createdAt: Date.now() },
    { id: uid(), title: 'Template marketplace for Lumid Studio', body: 'Creators sell presets & templates; we take a rev share.', venture: 'Lumid Studio', stage: 'spark', impact: 4, effort: 4, createdAt: Date.now() },
    { id: uid(), title: 'Shared workspace between AI & Studio', body: 'One login, one project space across both products.', venture: 'General', stage: 'spark', impact: 4, effort: 5, createdAt: Date.now() },
  ];
  db.tasks = [
    { id: uid(), title: 'Review Lumid AI onboarding funnel', venture: 'Lumid AI', due: t, priority: 'p1', done: false, createdAt: Date.now() },
    { id: uid(), title: 'Draft Lumid Studio launch announcement', venture: 'Lumid Studio', due: addDays(t, 2), priority: 'p2', done: false, createdAt: Date.now() },
  ];
  db.notes = [
    { id: uid(), title: 'Welcome to Lumid HQ 👋', body: 'Your CEO command center.\n\n• Capture any idea instantly from Today (try "task: call investor #ai !tomorrow").\n• Move ideas from Spark → Shipped on the Ideas board, and turn them into tasks with one tap.\n• Track goals (OKRs), KPIs, decisions and key people.\n• Everything is saved on this device. Back up from Settings.\n\nInstall it: open in your phone browser → Share → "Add to Home Screen".', venture: 'General', pinned: true, updatedAt: Date.now() },
  ];
  db.events = [
    { id: uid(), title: 'Weekly leadership sync', date: t, start: '10:00', end: '11:00', type: 'meeting', venture: 'General', notes: '' },
    { id: uid(), title: 'Deep work: product strategy', date: addDays(t, 1), start: '09:00', end: '11:00', type: 'focus', venture: 'Lumid AI', notes: '' },
  ];
  db.resources = [
    { id: uid(), url: 'https://www.youtube.com/watch?v=ii1jcLg-eIQ', platform: 'youtube', title: 'How to Start a Startup — YC lecture', status: 'watch', venture: 'General', notes: '', createdAt: Date.now() },
  ];
  db.plans = { [t]: '1. Ship onboarding fixes\n2. Investor follow-ups\n3. 2h deep work on roadmap' };
  db.goals = [
    { id: uid(), title: 'Grow Lumid AI to product-market fit', venture: 'Lumid AI', quarter: quarterOf(), keyResults: [{ text: 'Reach 1,000 weekly active users', progress: 35 }, { text: '40% week-4 retention', progress: 20 }] },
  ];
  db.metrics = [
    { id: uid(), name: 'Weekly active users', venture: 'Lumid AI', unit: '', target: 1000, entries: [[addDays(t, -21), 180], [addDays(t, -14), 240], [addDays(t, -7), 290], [t, 350]].map(([date, value]) => ({ date, value })) },
    { id: uid(), name: 'MRR', venture: 'Lumid Studio', unit: '$', target: 10000, entries: [[addDays(t, -21), 1200], [addDays(t, -14), 1500], [addDays(t, -7), 1450], [t, 1900]].map(([date, value]) => ({ date, value })) },
  ];
  return db;
}

function normalizeDb(raw) {
  const data = { ...emptyDb(), ...raw };
  if (!data.plans || typeof data.plans !== 'object') data.plans = {};
  return data;
}

function saveLocal() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
  catch { toast('Could not save — storage is full or blocked'); }
}

const store = {
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? normalizeDb(JSON.parse(raw)) : seed();
    } catch { return seed(); }
  },
  save() {
    saveLocal();
    cloud.markDirty();
  },
};

let db = store.load();
const state = { view: 'today', venture: 'All', calMonth: today().slice(0, 7), calDay: today(), calMode: 'month', metricRange: '6m', notesQuery: '', tasksTab: 'open', resTab: 'watch', resQuery: '' };

const ventureColor = (v) => VENTURE_COLORS[Math.max(0, db.ventures.indexOf(v)) % VENTURE_COLORS.length];
const ventureBadge = (v) => v ? `<span class="badge" style="--c:${ventureColor(v)}"><span class="dot"></span>${esc(v)}</span>` : '';
const byVenture = (arr) => state.venture === 'All' ? arr : arr.filter((x) => x.venture === state.venture);
const find = (col, id) => db[col].find((x) => x.id === id);

/* ---------- Schemas (drive the generic editor) ---------- */
const SCHEMAS = {
  ideas: {
    label: 'Idea', fields: [
      { k: 'title', label: 'Idea', type: 'text', req: true, ph: 'What if we…' },
      { k: 'body', label: 'Details', type: 'textarea', ph: 'Problem, solution, why now, first step…' },
      { row: [{ k: 'venture', label: 'Venture', type: 'venture' }, { k: 'stage', label: 'Stage', type: 'select', options: STAGES.map((s) => [s.id, s.label]), def: 'spark' }] },
      { row: [{ k: 'impact', label: 'Impact', type: 'range', min: 1, max: 5, def: 3 }, { k: 'effort', label: 'Effort', type: 'range', min: 1, max: 5, def: 3 }] },
    ],
  },
  tasks: {
    label: 'Task', fields: [
      { k: 'title', label: 'Task', type: 'text', req: true, ph: 'What needs to happen?' },
      { row: [{ k: 'due', label: 'Due', type: 'date' }, { k: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, def: 'p2' }] },
      { row: [{ k: 'venture', label: 'Venture', type: 'venture' }, { k: 'owner', label: 'Owner', type: 'text', ph: 'Me' }] },
      { k: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  notes: {
    label: 'Note', fields: [
      { k: 'title', label: 'Title', type: 'text', req: true, ph: 'Untitled note' },
      { k: 'body', label: 'Note', type: 'textarea', tall: true, ph: 'Write anything…' },
      { row: [{ k: 'venture', label: 'Venture', type: 'venture' }, { k: 'pinned', label: 'Pinned', type: 'checkbox' }] },
    ],
  },
  events: {
    label: 'Event', fields: [
      { k: 'title', label: 'Title', type: 'text', req: true, ph: 'Board meeting, investor call…' },
      { row: [{ k: 'date', label: 'Date', type: 'date', def: () => state.calDay, req: true }, { k: 'type', label: 'Type', type: 'select', options: EVENT_TYPES, def: 'meeting' }] },
      { row: [{ k: 'start', label: 'Start', type: 'time' }, { k: 'end', label: 'End', type: 'time' }] },
      { k: 'venture', label: 'Venture', type: 'venture' },
      { k: 'notes', label: 'Agenda / notes', type: 'textarea' },
    ],
  },
  goals: {
    label: 'Goal', fields: [
      { k: 'title', label: 'Objective', type: 'text', req: true, ph: 'Ambitious, qualitative goal' },
      { row: [{ k: 'venture', label: 'Venture', type: 'venture' }, { k: 'quarter', label: 'Quarter', type: 'text', def: () => quarterOf() }] },
      { k: 'keyResults', label: 'Key results (one per line)', type: 'krs', ph: 'Reach 1,000 weekly active users\nClose seed round' },
    ],
  },
  metrics: {
    label: 'KPI', fields: [
      { k: 'name', label: 'Metric', type: 'text', req: true, ph: 'MRR, Active users, Runway…' },
      { row: [{ k: 'venture', label: 'Venture', type: 'venture' }, { k: 'unit', label: 'Unit / prefix', type: 'text', ph: '$, %, users' }] },
      { k: 'target', label: 'Target', type: 'number' },
    ],
  },
  decisions: {
    label: 'Decision', fields: [
      { k: 'title', label: 'Decision', type: 'text', req: true, ph: 'We will…' },
      { k: 'context', label: 'Context & options considered', type: 'textarea' },
      { k: 'rationale', label: 'Why', type: 'textarea' },
      { row: [{ k: 'date', label: 'Decided on', type: 'date', def: today }, { k: 'review', label: 'Review on', type: 'date' }] },
      { k: 'venture', label: 'Venture', type: 'venture' },
    ],
  },
  resources: {
    label: 'Resource', fields: [
      { k: 'url', label: 'Link', type: 'url', req: true, ph: 'https://…' },
      { k: 'title', label: 'Title', type: 'text', ph: 'What is it about?' },
      { row: [{ k: 'status', label: 'Status', type: 'select', options: RES_STATUS, def: 'watch' }, { k: 'venture', label: 'Venture', type: 'venture' }] },
      { k: 'notes', label: 'Key takeaways', type: 'textarea', ph: 'Why it matters, what to apply…' },
    ],
  },
  people: {
    label: 'Person', fields: [
      { k: 'name', label: 'Name', type: 'text', req: true },
      { row: [{ k: 'role', label: 'Role', type: 'text', ph: 'Investor, Advisor, Hire…' }, { k: 'company', label: 'Company', type: 'text' }] },
      { row: [{ k: 'email', label: 'Email', type: 'email' }, { k: 'followUp', label: 'Next follow-up', type: 'date' }] },
      { k: 'venture', label: 'Venture', type: 'venture' },
      { k: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
};

const VIEWS = [
  { id: 'today', label: 'Today', col: null },
  { id: 'ideas', label: 'Ideas', col: 'ideas' },
  { id: 'tasks', label: 'Tasks', col: 'tasks' },
  { id: 'notes', label: 'Notes', col: 'notes' },
  { id: 'schedule', label: 'Schedule', col: 'events' },
  { id: 'resources', label: 'Resources', col: 'resources' },
  { id: 'goals', label: 'Goals', col: 'goals' },
  { id: 'metrics', label: 'KPIs', col: 'metrics' },
  { id: 'decisions', label: 'Decisions', col: 'decisions' },
  { id: 'people', label: 'People', col: 'people' },
  { id: 'settings', label: 'Settings', col: null },
];
const MOBILE_TABS = ['today', 'ideas', 'tasks', 'notes', 'schedule'];

/* ---------- Mutations ---------- */
let lastDeleted = null;

function upsert(col, item) {
  const i = db[col].findIndex((x) => x.id === item.id);
  if (i >= 0) db[col][i] = item; else db[col].unshift(item);
  store.save();
}

function remove(col, id) {
  const i = db[col].findIndex((x) => x.id === id);
  if (i < 0) return;
  lastDeleted = { col, item: db[col][i], index: i };
  db[col].splice(i, 1);
  store.save();
  render();
  toast(`${SCHEMAS[col].label} deleted`, 'Undo', () => {
    db[lastDeleted.col].splice(lastDeleted.index, 0, lastDeleted.item);
    store.save();
    render();
  });
}

/* ---------- Natural-language date & time ---------- */
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_RE = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?';
const pad2 = (n) => String(n).padStart(2, '0');
const hhmm = (h, m = 0) => `${pad2(h)}:${pad2(m)}`;
const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + mins, 23 * 60 + 59);
  return hhmm(Math.floor(total / 60), total % 60);
};

// Pulls dates/times out of free text ("tomorrow 3pm", "next fri at 10:30", "28 sep")
// and returns the remaining text plus ISO date and HH:MM times.
function parseWhen(input) {
  let t = ` ${input} `;
  let date = '';
  let time = '';
  let duration = 0;
  const base = today();
  const take = (re, fn) => {
    t = t.replace(re, (...m) => {
      const hit = fn(...m);
      return hit === false ? m[0] : ' ';
    });
  };
  const futureDate = (month, day) => {
    const y = fromISO(base).getFullYear();
    const d = new Date(y, month, day);
    if (d.getMonth() !== month) return false;
    if (toISO(d) < base) d.setFullYear(y + 1);
    return toISO(d);
  };

  // Durations: "for 30 min", "for 2 hours"
  take(/\bfor\s+(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minutes)\b/i, (_, n, u) => {
    duration = Math.round(Number(n) * (/^h/i.test(u) ? 60 : 1));
  });

  // Times
  take(/\b(?:at\s+|@\s*)?(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?=[\s,.!?]|$)/i, (_, h, m, ap) => {
    let hour = Number(h) % 12;
    if (/^p/i.test(ap)) hour += 12;
    if (Number(h) > 12) return false;
    time = hhmm(hour, Number(m || 0));
  });
  if (!time) take(/\b(?:at\s+|@\s*)?([01]?\d|2[0-3]):([0-5]\d)\b/i, (_, h, m) => { time = hhmm(Number(h), Number(m)); });
  if (!time) take(/\b(?:at\s+)?(noon|midday|midnight)\b/i, (_, w) => { time = /mid(night)/i.test(w) ? '00:00' : '12:00'; });
  if (!time) take(/\b(?:at|@)\s+(\d{1,2})\b(?!\s*(?:[/-]|\w))/i, (_, h) => {
    const n = Number(h);
    if (n > 23) return false;
    time = hhmm(n >= 1 && n <= 7 ? n + 12 : n); // "at 3" means 3pm
  });

  // Dates
  take(/\b(?:on\s+|by\s+)?(?:the\s+)?day\s+after\s+tom+or+ow\b/i, () => { date = addDays(base, 2); });
  if (!date) take(/\b(?:on\s+|by\s+)?(today|tonight)\b/i, (_, w) => {
    date = base;
    if (/night/i.test(w) && !time) time = '20:00';
  });
  if (!date) take(/\b(?:on\s+|by\s+)?(tom+or+ow|tmrw?|tomm?orr?ow)\b/i, () => { date = addDays(base, 1); });
  if (!date) take(/\bin\s+(\d+|a|an|one|two|three)\s+(day|days|week|weeks)\b/i, (_, n, u) => {
    const num = { a: 1, an: 1, one: 1, two: 2, three: 3 }[n.toLowerCase()] || Number(n);
    date = addDays(base, num * (/week/i.test(u) ? 7 : 1));
  });
  if (!date) take(/\b(?:on\s+|by\s+)?next\s+week\b/i, () => { date = addDays(base, 7); });
  if (!date) take(/\b(?:on\s+|by\s+)?(this\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues?|wed|thu(?:rs?)?|fri)\b\.?/i, (_, which, day) => {
    const target = WEEKDAYS.findIndex((w) => w.startsWith(day.toLowerCase().slice(0, 3)));
    const now = fromISO(base).getDay();
    let diff = (target - now + 7) % 7;
    if (/next/i.test(which || '') || diff === 0) diff = diff || 7;
    date = addDays(base, diff);
  });
  if (!date) take(new RegExp(`\\b(?:on\\s+|by\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RE}(?:\\s+(\\d{4}))?`, 'i'), (_, d, mon, y) => {
    const iso = futureDate(MONTHS.indexOf(mon.toLowerCase()), Number(d));
    if (!iso) return false;
    date = y ? `${y}${iso.slice(4)}` : iso;
  });
  if (!date) take(new RegExp(`\\b(?:on\\s+|by\\s+)?${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'i'), (_, mon, d, y) => {
    const iso = futureDate(MONTHS.indexOf(mon.toLowerCase()), Number(d));
    if (!iso) return false;
    date = y ? `${y}${iso.slice(4)}` : iso;
  });
  if (!date) take(/\b(\d{4})-(\d{2})-(\d{2})\b/, (m) => { date = m.trim(); });
  if (!date) take(/\b(?:on\s+|by\s+)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/, (_, d, mo, y) => {
    const iso = futureDate(Number(mo) - 1, Number(d)); // day/month
    if (!iso) return false;
    date = y ? `${y.length === 2 ? '20' + y : y}${iso.slice(4)}` : iso;
  });

  // Fuzzy parts of the day, only if nothing more precise was given
  if (!time) take(/\b(?:in\s+the\s+|this\s+)?(morning|afternoon|evening)\b/i, (_, w) => {
    time = { morning: '09:00', afternoon: '14:00', evening: '18:00' }[w.toLowerCase()];
  });

  const end = time ? addMinutes(time, duration || 60) : '';
  const rest = t.replace(/\s+/g, ' ').replace(/\s+(at|on|by|for|@)\s*$/i, '').replace(/^\s*(at|on|by)\s+/i, '').trim();
  return { rest, date, time, end };
}

/* ---------- Quick capture parser ---------- */
function parseCapture(text, defaultKind = 'ideas') {
  let kind = defaultKind;
  let t = text.trim();
  const prefix = t.match(/^(idea|task|todo|note|event|meet|meeting|decision|person|link|watch|video|reel)\s*:\s*/i);
  if (prefix) {
    kind = { idea: 'ideas', task: 'tasks', todo: 'tasks', note: 'notes', event: 'events', meet: 'events', meeting: 'events', decision: 'decisions', person: 'people', link: 'resources', watch: 'resources', video: 'resources', reel: 'resources' }[prefix[1].toLowerCase()];
    t = t.slice(prefix[0].length);
  }
  let venture = state.venture !== 'All' ? state.venture : 'General';
  t = t.replace(/#(\w+)/g, (m, tag) => {
    const v = db.ventures.find((x) => slug(x) === slug(tag) || slug(x.split(' ').pop()) === slug(tag));
    if (!v) return m;
    venture = v;
    return '';
  });
  // Plain mentions like "for lumid ai" also set the venture (longest name first).
  if (venture === 'General' || venture === state.venture) {
    const named = [...db.ventures].sort((a, b) => b.length - a.length).find((v) => v !== 'General' && new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t));
    if (named) venture = named;
  }
  let due = '';
  t = t.replace(/!(today|tomorrow|week|p1|p2|p3)\b/gi, (m, w) => {
    const k = w.toLowerCase();
    if (k === 'today') due = today();
    else if (k === 'tomorrow') due = addDays(today(), 1);
    else if (k === 'week') due = addDays(today(), 7);
    else return m;
    return '';
  });
  let priority = 'p2';
  t = t.replace(/!(p[123])\b/gi, (_, p) => { priority = p.toLowerCase(); return ''; });
  const when = ['events', 'tasks', 'people', 'decisions'].includes(kind) ? parseWhen(t) : { rest: t, date: '', time: '', end: '' };
  return { kind, title: when.rest.replace(/\s+/g, ' ').trim(), venture, due: due || when.date, time: when.time, end: when.end, priority };
}

function capture(text, date = '', defaultKind = 'ideas') {
  const url = text.match(URL_RE);
  if (url) {
    const rest = parseCapture(text.replace(url[0], ''));
    const res = addResource(url[0], rest.title, { venture: rest.venture });
    if (!res) return;
    render();
    return toast('Saved to Resources', 'Open', () => go('resources'));
  }
  const p = parseCapture(text, defaultKind);
  if (!p.title) return;
  if (p.kind === 'resources') return toast('Paste a full link to save a resource');
  p.due ||= date;
  if (p.kind === 'events') {
    openEditor('events', null, { title: p.title, date: p.due, start: p.time, end: p.end, type: 'meeting', venture: p.venture, notes: '' },
      { confirm: true, missing: [!p.due && 'date', !p.time && 'start'].filter(Boolean), require: ['date'] });
    return 'confirm';
  }
  if (p.kind === 'tasks') {
    openEditor('tasks', null, { title: p.title, due: p.due, priority: p.priority, venture: p.venture },
      { confirm: true, missing: p.due ? [] : ['due'] });
    return 'confirm';
  }
  const base = { id: uid(), venture: p.venture, createdAt: Date.now() };
  const map = {
    ideas: { ...base, title: p.title, body: '', stage: 'spark', impact: 3, effort: 3 },
    tasks: { ...base, title: p.title, due: p.due, priority: p.priority, done: false },
    notes: { ...base, title: p.title, body: '', pinned: false, updatedAt: Date.now() },
    events: { ...base, title: p.title, date: p.due || today(), start: '', end: '', type: 'meeting', notes: '' },
    decisions: { ...base, title: p.title, date: today(), context: '', rationale: '' },
    people: { ...base, name: p.title, followUp: p.due },
  };
  upsert(p.kind, map[p.kind]);
  render();
  toast(`${SCHEMAS[p.kind].label} captured → ${p.venture}`, 'Open', () => openEditor(p.kind, map[p.kind].id));
}

/* ---------- Shell rendering ---------- */
function renderNav() {
  const counts = {
    ideas: db.ideas.filter((i) => !['shipped', 'parked'].includes(i.stage)).length,
    tasks: db.tasks.filter((t) => !t.done).length,
    notes: db.notes.length,
  };
  $('#side-nav').innerHTML = VIEWS.map((v) => `
    <button class="nav-link ${state.view === v.id ? 'active' : ''}" data-nav="${v.id}">
      ${appIcon(v.id)}<span>${v.label}</span>${counts[v.id] ? `<span class="count">${counts[v.id]}</span>` : ''}
    </button>`).join('');

  const moreActive = !MOBILE_TABS.includes(state.view);
  $('#bottom-nav').innerHTML = MOBILE_TABS.map((id) => {
    const v = VIEWS.find((x) => x.id === id);
    return `<button class="${state.view === id ? 'active' : ''}" data-nav="${id}">${icon(id)}<span>${v.label}</span></button>`;
  }).join('') + `<button class="${moreActive ? 'active' : ''}" data-action="more">${icon('more')}<span>More</span></button>`;

  const filter = ['All', ...db.ventures];
  $('#venture-filter').innerHTML = filter.map((v) => `
    <button class="chip ${state.venture === v ? 'active' : ''}" data-venture="${esc(v)}" role="tab" aria-selected="${state.venture === v}">
      ${v === 'All' ? '' : `<span class="dot" style="--c:${ventureColor(v)}"></span>`}${esc(v)}
    </button>`).join('');
  $('#venture-filter').hidden = state.view === 'settings';
  $('#view-title').innerHTML = state.view === 'today'
    ? `<span class="brand-mark" aria-hidden="true">${icon('sparkle')}</span>Lumid`
    : esc(VIEWS.find((v) => v.id === state.view).label);
  $('.fab').hidden = state.view === 'settings';
}

function render() {
  renderNav();
  $('#view').innerHTML = RENDERERS[state.view]();
  document.title = `${VIEWS.find((v) => v.id === state.view).label} · Lumid HQ`;
}

function go(view) {
  state.view = view;
  history.replaceState(null, '', `#${view}`);
  render();
  window.scrollTo({ top: 0 });
}

const empty = (title, hint) => `<div class="empty"><strong>${esc(title)}</strong>${esc(hint)}</div>`;

/* ---------- View: Today ---------- */
function viewToday() {
  const t = today();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const tasks = byVenture(db.tasks).filter((x) => !x.done);
  const overdue = tasks.filter((x) => x.due && x.due < t);
  const dueToday = tasks.filter((x) => x.due === t);
  const focus = [...overdue, ...dueToday, ...tasks.filter((x) => x.priority === 'p1' && (!x.due || x.due > t))].slice(0, 6);
  const events = sortEvents(byVenture(db.events).filter((e) => e.date === t));
  const upcoming = sortEvents(byVenture(db.events).filter((e) => e.date > t && e.date <= addDays(t, 7))).slice(0, 4);
  const followUps = byVenture(db.people).filter((p) => p.followUp && p.followUp <= t);
  const reviews = byVenture(db.decisions).filter((d) => d.review && d.review <= t);
  const ideas = byVenture(db.ideas);
  const topIdeas = ideas.filter((i) => ['spark', 'exploring'].includes(i.stage)).sort((a, b) => ideaScore(b) - ideaScore(a)).slice(0, 3);
  const pinned = byVenture(db.notes).filter((n) => n.pinned).slice(0, 2);
  const toWatch = byVenture(db.resources).filter((r) => r.status === 'watch').slice(0, 3);
  const dayPlan = db.plans[t];
  const goals = byVenture(db.goals);
  const goalAvg = goals.length ? Math.round(goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length) : 0;
  const todayMetrics = byVenture(db.metrics).slice(0, 3);

  return `
    <div class="hero">
      <svg class="hero-deco" viewBox="0 0 320 320" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1">
        ${[40, 72, 104, 136, 160].map((r) => `<circle cx="160" cy="160" r="${r}"/>`).join('')}
        <path d="M0 160h320M160 0v320M47 47l226 226M273 47 47 273"/>
      </svg>
      <span class="hero-badge" aria-hidden="true">${icon(h >= 6 && h < 18 ? 'sun' : 'moon')}</span>
      <h2>${greet}</h2>
      <p class="hero-date">${fmtDate(t, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <p class="hero-meta">${dueToday.length} due today · ${events.length} on the calendar</p>
      ${captureBox()}
    </div>

    <div class="grid tiles section">
      ${statTile('Open tasks', tasks.length, overdue.length ? `<span class="delta down">${overdue.length} overdue</span>` : '<span class="muted">on track</span>', 'tasks', 'tasks',
        miniBars(dailyCounts(byVenture(db.tasks).filter((x) => x.done && x.doneAt).map((x) => toISO(new Date(x.doneAt)))), 'var(--text)'))}
      ${statTile('Active ideas', ideas.filter((i) => !['shipped', 'parked'].includes(i.stage)).length, `<span class="muted">${ideas.filter((i) => i.stage === 'building').length} building</span>`, 'ideas', 'ideas',
        miniBars(dailyCounts(ideas.filter((i) => i.createdAt).map((i) => toISO(new Date(i.createdAt)))), 'var(--coral)'))}
      ${statTile('Goal progress', goalAvg + '%', `<span class="muted">${goals.length} objectives</span>`, 'goals', 'goals',
        `<div class="tile-progress" role="progressbar" aria-valuenow="${goalAvg}" aria-valuemin="0" aria-valuemax="100"><span style="width:${goalAvg}%"></span></div>`)}
      ${todayMetrics.map((m, i) => metricTile(m, (3 + todayMetrics.length) % 2 === 1 && i === todayMetrics.length - 1)).join('')}
    </div>

    <div class="grid two">
      <div class="card">
        <div class="card-head">${appIcon('bolt')}<h3>Focus</h3><button class="link" data-nav="tasks">All tasks →</button></div>
        ${focus.length ? `<div class="list">${focus.map(taskRow).join('')}</div>` : empty('Clear runway', 'Nothing urgent. Plan the next big move.')}
      </div>
      <div class="card">
        <div class="card-head">${appIcon('schedule')}<h3>Today's schedule</h3><button class="link" data-nav="schedule">Calendar →</button></div>
        ${events.length ? `<div class="list">${events.map(eventRow).join('')}</div>` : empty('No meetings today', 'Block time for deep work.')}
        ${upcoming.length ? `<p class="section-title" style="margin-top:12px">Next 7 days</p><div class="list">${upcoming.map((e) => eventRow(e, true)).join('')}</div>` : ''}
      </div>
      ${followUps.length || reviews.length ? `
      <div class="card">
        <div class="card-head">${appIcon('bell')}<h3>Needs attention</h3></div>
        <div class="list">
          ${followUps.map((p) => `<div class="item"><div class="item-main" data-edit="people:${p.id}"><div class="item-title">Follow up with ${esc(p.name)}</div><div class="item-meta">${esc(p.role || '')} ${p.company ? '· ' + esc(p.company) : ''} <span class="badge warn">${relDate(p.followUp)}</span></div></div></div>`).join('')}
          ${reviews.map((d) => `<div class="item"><div class="item-main" data-edit="decisions:${d.id}"><div class="item-title">Review decision: ${esc(d.title)}</div><div class="item-meta"><span class="badge warn">${relDate(d.review)}</span></div></div></div>`).join('')}
        </div>
      </div>` : ''}
      <div class="card">
        <div class="card-head">${appIcon('ideas')}<h3>Top ideas</h3><button class="link" data-nav="ideas">Board →</button></div>
        ${topIdeas.length ? `<div class="list">${topIdeas.map((i) => `
          <div class="item"><div class="item-main" data-edit="ideas:${i.id}"><div class="item-title">${esc(i.title)}</div>
          <div class="item-meta">${ventureBadge(i.venture)} <span class="score">★ ${ideaScore(i).toFixed(0)}</span></div></div>
          <button class="btn sm ghost" data-action="idea-to-task" data-id="${i.id}">Implement ${icon('arrow')}</button></div>`).join('')}</div>`
          : empty('No ideas yet', 'Capture your next big idea above.')}
      </div>
      <div class="card">
        <div class="card-head">${appIcon('notes')}<h3>Today's plan</h3><button class="link" data-day="${t}" data-go-month>Plan →</button></div>
        ${dayPlan ? `<div class="clip small" style="-webkit-line-clamp:6">${esc(dayPlan)}</div>` : empty('No plan yet', 'Write your top 3 outcomes for today.')}
      </div>
      ${toWatch.length ? `<div class="card">
        <div class="card-head">${appIcon('resources')}<h3>Up next to watch</h3><button class="link" data-nav="resources">All →</button></div>
        <div class="list">${toWatch.map((r) => `<div class="item"><span class="thumb-mini">${(PLATFORMS[r.platform] || PLATFORMS.link).emoji}</span>
          <a class="item-main" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none"><div class="item-title">${esc(r.title)}</div><div class="item-meta">${esc(hostOf(r.url))}</div></a>
          <button class="btn sm ghost" data-res-done="${r.id}">Done</button></div>`).join('')}</div>
      </div>` : ''}
      ${pinned.map((n) => `<div class="card click" data-edit="notes:${n.id}"><div class="card-head">${appIcon('pin')}<h3>${esc(n.title)}</h3></div><div class="clip muted small">${esc(n.body)}</div></div>`).join('')}
    </div>`;
}

const CAPTURE_TYPES = [
  { k: 'idea', label: 'Idea', icon: 'ideas', ph: 'Capture an idea…' },
  { k: 'task', label: 'Task', icon: 'tasks', ph: 'e.g. Send deck to investors tomorrow !p1' },
  { k: 'event', label: 'Event', icon: 'schedule', ph: 'e.g. Meet psychologist for Lumid AI tomorrow 3pm' },
  { k: 'note', label: 'Note', icon: 'notes', ph: 'Note title…' },
  { k: 'decision', label: 'Decision', icon: 'decisions', ph: 'We decided to…' },
  { k: 'link', label: 'Link', icon: 'resources', ph: 'Paste a reel, YouTube or article link' },
];

function captureBox() {
  const tags = db.ventures.filter((v) => v !== 'General').map((v) => [`#${slug(v.split(' ').pop())}`, v, `style="--c:${ventureColor(v)}"`]);
  const extras = [...tags, ['today', 'Today', ''], ['tomorrow', 'Tomorrow', ''], ['at 10am', '10am', ''], ['!p1', 'Urgent', 'data-tone="danger"']];
  return `<form class="capture capture-box" data-form="capture">
      <input type="text" name="q" placeholder="${CAPTURE_TYPES[0].ph}" autocomplete="off" enterkeyhint="done" aria-label="Quick capture">
      <button class="icon-btn bare mic-btn" type="button" data-action="voice" aria-label="Speak to capture" aria-pressed="false">${icon('mic')}</button>
      <button class="btn" type="submit" aria-label="Capture">${icon('bolt')}</button>
    </form>
    <div class="pills" role="group" aria-label="What are you capturing?">
      ${CAPTURE_TYPES.map((c) => `<button type="button" class="pill ${c.k === 'idea' ? 'active' : ''}" data-cap-type="${c.k}">${icon(c.icon)}${c.label}</button>`).join('')}
    </div>
    <div class="pills sub" role="group" aria-label="Add details">
      ${extras.map(([token, label, attr]) => `<button type="button" class="pill" data-cap-token="${esc(token)}" ${attr}>${token.startsWith('#') ? '<span class="dot"></span>' : '+ '}${esc(label)}</button>`).join('')}
    </div>`;
}

const CAP_PREFIX_RE = /^\s*(idea|task|todo|note|event|meet|meeting|decision|person|link|watch|video|reel)\s*:\s*/i;

function setCaptureType(kind) {
  const input = $('[data-form="capture"] input');
  if (!input) return;
  const rest = input.value.replace(CAP_PREFIX_RE, '');
  input.value = kind === 'idea' ? rest : `${kind}: ${rest}`;
  syncCapturePills(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function addCaptureToken(token) {
  const input = $('[data-form="capture"] input');
  if (!input) return;
  const v = input.value.replace(/\s+$/, '');
  input.value = `${v}${v ? ' ' : ''}${token} `;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function syncCapturePills(input) {
  const m = input.value.match(CAP_PREFIX_RE);
  const alias = { todo: 'task', meet: 'event', meeting: 'event', watch: 'link', video: 'link', reel: 'link', person: 'idea' };
  const kind = m ? (alias[m[1].toLowerCase()] || m[1].toLowerCase()) : URL_RE.test(input.value) ? 'link' : 'idea';
  $$('[data-cap-type]').forEach((b) => b.classList.toggle('active', b.dataset.capType === kind));
  input.placeholder = (CAPTURE_TYPES.find((c) => c.k === kind) || CAPTURE_TYPES[0]).ph;
}

function tileHead(label, glyph, extra = '') {
  const [, color] = TILE_GRADIENTS[glyph] || TILE_GRADIENTS.today;
  return `<div class="tile-head"><span class="tile-icon" style="--ic:${color}">${icon(glyph)}</span><span class="label">${label}</span>${extra}<span class="tile-chev">${icon('chevron')}</span></div>`;
}

function statTile(label, value, sub, nav, glyph, viz = '') {
  return `<div class="tile card click" data-nav="${nav}">
    ${tileHead(label, glyph)}
    <div class="tile-body"><div><div class="value">${value}</div><div class="delta">${sub}</div></div>${viz}</div>
  </div>`;
}

// Counts per day for the last `days` days (oldest first).
function dailyCounts(isoDates, days = 5) {
  const t = today();
  return Array.from({ length: days }, (_, i) => isoDates.filter((d) => d === addDays(t, i - days + 1)).length);
}

function miniBars(counts, color) {
  const max = Math.max(...counts, 1);
  const empty = counts.every((n) => !n);
  return `<div class="mini-bars" style="--bc:${color}" aria-hidden="true">${counts.map((n, i) => {
    const h = empty ? 25 + i * 18 : Math.max(12, Math.round((n / max) * 100));
    return `<i style="height:${h}%;opacity:${(0.3 + i * 0.175).toFixed(2)}"></i>`;
  }).join('')}</div>`;
}

/* ---------- View: Ideas ---------- */
const ideaScore = (i) => (Number(i.impact) || 3) * 2 - (Number(i.effort) || 3) + 5; // 0–14ish, higher = better bet

function viewIdeas() {
  const ideas = byVenture(db.ideas);
  if (!ideas.length) return empty('Your idea pipeline is empty', 'Tap + to capture your first idea. Random thoughts welcome.');
  return `<div class="board">${STAGES.map((s) => {
    const list = ideas.filter((i) => i.stage === s.id).sort((a, b) => ideaScore(b) - ideaScore(a));
    return `<div class="col" data-drop="${s.id}">
      <div class="col-head"><span class="dot" style="--c:${s.color}"></span>${s.label}<span class="count">${list.length}</span></div>
      ${list.map((i) => `
        <div class="card click" draggable="true" data-drag="${i.id}" data-edit="ideas:${i.id}">
          <div class="idea-title">${esc(i.title)}</div>
          ${i.body ? `<div class="clip muted small">${esc(i.body)}</div>` : ''}
          <div class="row" style="margin-top:8px">
            ${ventureBadge(i.venture)}
            <span class="small muted">Impact ${i.impact} · Effort ${i.effort}</span>
            <span class="spacer"></span><span class="score" title="Score">★ ${ideaScore(i).toFixed(0)}</span>
          </div>
          <div class="row" style="margin-top:8px">
            <select class="stage-select" data-stage="${i.id}" aria-label="Move to stage" style="padding:4px 8px;font-size:13px;flex:1">
              ${STAGES.map((x) => `<option value="${x.id}" ${x.id === i.stage ? 'selected' : ''}>${x.label}</option>`).join('')}
            </select>
            ${i.stage !== 'shipped' ? `<button class="btn sm" data-action="idea-to-task" data-id="${i.id}">Implement</button>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

function ideaToTask(id) {
  const idea = find('ideas', id);
  if (!idea) return;
  const task = { id: uid(), title: `Kick off: ${idea.title}`, venture: idea.venture, due: addDays(today(), 3), priority: 'p2', done: false, ideaId: id, notes: idea.body, createdAt: Date.now() };
  upsert('tasks', task);
  if (['spark', 'exploring'].includes(idea.stage)) idea.stage = 'building';
  store.save();
  render();
  toast('Task created & idea moved to Building', 'Edit', () => openEditor('tasks', task.id));
}

/* ---------- View: Tasks ---------- */
function taskRow(t) {
  const overdue = !t.done && t.due && t.due < today();
  const idea = t.ideaId && find('ideas', t.ideaId);
  return `<div class="item ${t.done ? 'done' : ''}">
    <span class="prio ${t.priority || 'p3'}"></span>
    <input type="checkbox" class="check" data-toggle="${t.id}" ${t.done ? 'checked' : ''} aria-label="Complete">
    <div class="item-main" data-edit="tasks:${t.id}">
      <div class="item-title">${esc(t.title)}</div>
      <div class="item-meta">
        ${t.due ? `<span class="badge ${overdue ? 'danger' : t.due === today() ? 'warn' : ''}">${relDate(t.due)}</span>` : ''}
        ${ventureBadge(t.venture)}
        ${t.owner ? `<span>@${esc(t.owner)}</span>` : ''}
        ${idea ? `<span>💡 ${esc(idea.title)}</span>` : ''}
      </div>
    </div>
  </div>`;
}

function viewTasks() {
  const all = byVenture(db.tasks);
  const t = today();
  const tab = state.tasksTab;
  const seg = `<div class="seg">${[['open', 'Open'], ['done', 'Completed']].map(([k, l]) => `<button class="${tab === k ? 'active' : ''}" data-tasks-tab="${k}">${l}</button>`).join('')}</div>`;
  if (tab === 'done') {
    const done = all.filter((x) => x.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    return `<div class="toolbar">${seg}<span class="spacer"></span>${done.length ? '<button class="btn sm ghost" data-action="clear-done">Clear completed</button>' : ''}</div>
      <div class="card">${done.length ? `<div class="list">${done.map(taskRow).join('')}</div>` : empty('Nothing completed yet', 'Get after it.')}</div>`;
  }
  const open = all.filter((x) => !x.done).sort((a, b) => (a.priority || 'p3').localeCompare(b.priority || 'p3'));
  const groups = [
    ['Overdue', open.filter((x) => x.due && x.due < t)],
    ['Today', open.filter((x) => x.due === t)],
    ['This week', open.filter((x) => x.due > t && x.due <= addDays(t, 7))],
    ['Later', open.filter((x) => x.due > addDays(t, 7)).sort((a, b) => a.due.localeCompare(b.due))],
    ['No date', open.filter((x) => !x.due)],
  ].filter(([, l]) => l.length);
  return `<div class="toolbar">${seg}</div>
    ${groups.length ? groups.map(([name, list]) => `
      <div class="section"><p class="section-title">${name} · ${list.length}</p><div class="card" style="padding:4px 12px"><div class="list">${list.map(taskRow).join('')}</div></div></div>`).join('')
      : empty('Inbox zero', 'No open tasks. Tap + to add one.')}`;
}

/* ---------- View: Notes ---------- */
function viewNotes() {
  const q = state.notesQuery.toLowerCase();
  const notes = byVenture(db.notes)
    .filter((n) => !q || (n.title + ' ' + n.body).toLowerCase().includes(q))
    .sort((a, b) => (!!b.pinned - !!a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0));
  return `<div class="toolbar"><input type="search" data-notes-search placeholder="Search notes…" value="${esc(state.notesQuery)}" aria-label="Search notes"></div>
    ${notes.length ? `<div class="grid cards">${notes.map((n) => `
      <div class="card click" data-edit="notes:${n.id}">
        <div class="card-head">${n.pinned ? icon('pin') : ''}<h3>${esc(n.title)}</h3></div>
        <div class="clip muted small">${esc(n.body) || '<i>Empty note</i>'}</div>
        <div class="row" style="margin-top:12px">${ventureBadge(n.venture)}<span class="spacer"></span><span class="small muted">${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : ''}</span></div>
      </div>`).join('')}</div>` : empty(q ? 'No matching notes' : 'No notes yet', 'Meeting notes, strategy, brain dumps — tap + to write.')}`;
}

/* ---------- View: Schedule ---------- */
const sortEvents = (list) => [...list].sort((a, b) => (a.date + (a.start || '99')).localeCompare(b.date + (b.start || '99')));
const eventTypeLabel = (t) => (EVENT_TYPES.find(([k]) => k === t) || [, 'Event'])[1];

function eventRow(e, showDate = false) {
  return `<div class="item">
    <span class="time">${showDate ? fmtDate(e.date, { month: 'short', day: 'numeric' }) : esc(e.start || 'All day')}</span>
    <div class="item-main" data-edit="events:${e.id}">
      <div class="item-title">${esc(e.title)}</div>
      <div class="item-meta">${e.start ? `${esc(e.start)}${e.end ? '–' + esc(e.end) : ''} ·` : ''} ${eventTypeLabel(e.type)} ${ventureBadge(e.venture)}</div>
    </div>
  </div>`;
}

function scheduleIndex() {
  const byDay = byVenture(db.events).reduce((acc, e) => ((acc[e.date] ||= []).push(e), acc), {});
  const tasksByDay = byVenture(db.tasks).filter((x) => !x.done && x.due).reduce((acc, x) => ((acc[x.due] ||= []).push(x), acc), {});
  return { byDay, tasksByDay };
}
const isDeadline = (e) => ['deadline', 'launch'].includes(e.type);
const weekStart = (iso) => { const d = fromISO(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(d); };

function viewSchedule() {
  const modes = [['month', 'Month'], ['week', 'Week'], ['deadlines', 'Deadlines']];
  const seg = `<div class="seg">${modes.map(([k, l]) => `<button class="${state.calMode === k ? 'active' : ''}" data-cal-mode="${k}">${l}</button>`).join('')}</div>`;
  const body = { month: scheduleMonth, week: scheduleWeek, deadlines: scheduleDeadlines }[state.calMode]();
  return `<div class="toolbar">${seg}<span class="spacer"></span>
    <button class="btn sm ghost" data-action="new-deadline">${icon('plus')} Deadline</button>
    <button class="btn sm ghost" data-action="ics" aria-label="Export to calendar">${icon('download')} .ics</button></div>${body}`;
}

function dayPanel(iso, idx) {
  const evs = sortEvents(idx.byDay[iso] || []);
  const tasks = idx.tasksByDay[iso] || [];
  return `<div class="card section">
    <div class="card-head"><h3>${fmtDate(iso, { weekday: 'long', month: 'long', day: 'numeric' })}</h3><button class="link" data-action="new-event">+ Event</button></div>
    <label class="section-title" for="plan-${iso}">Plan for the day</label>
    <textarea id="plan-${iso}" class="plan" data-plan="${iso}" placeholder="Top 3 outcomes, themes, what to say no to…">${esc(db.plans[iso] || '')}</textarea>
    <form class="capture" data-form="day-add" data-date="${iso}" style="margin:12px 0 4px">
      <input type="text" name="q" placeholder="Add task to this day (or event: …)" autocomplete="off" aria-label="Add to this day">
      <button class="btn" type="submit" aria-label="Add">${icon('plus')}</button>
    </form>
    ${evs.length || tasks.length ? `<div class="list">${evs.map((e) => eventRow(e)).join('')}${tasks.map(taskRow).join('')}</div>` : '<p class="muted small">Nothing scheduled yet.</p>'}
  </div>`;
}

function scheduleMonth() {
  const [y, m] = state.calMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const start = fromISO(weekStart(toISO(first)));
  const idx = scheduleIndex();
  const t = today();

  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = toISO(d);
    const evs = idx.byDay[iso] || [];
    const dots = evs.slice(0, 3).map((e) => `<i style="--c:${isDeadline(e) ? 'var(--danger)' : ventureColor(e.venture)}"></i>`).join('') + (idx.tasksByDay[iso] ? '<i style="--c:var(--warn)"></i>' : '');
    const cls = [d.getMonth() !== m - 1 && 'out', iso === t && 'today', iso === state.calDay && 'sel', evs.some(isDeadline) && 'dl', db.plans[iso] && 'planned'].filter(Boolean).join(' ');
    cells += `<button class="day ${cls}" data-day="${iso}">${d.getDate()}<span class="dots">${dots}</span></button>`;
  }
  const upcoming = sortEvents(byVenture(db.events).filter((e) => e.date >= t)).slice(0, 6);

  return `<div class="grid two">
    <div>
      <div class="card">
        <div class="cal-head">
          <h3>${first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
          <button class="icon-btn" data-month="-1" aria-label="Previous month">${icon('left')}</button>
          <button class="btn sm ghost" data-action="cal-today">Today</button>
          <button class="icon-btn" data-month="1" aria-label="Next month">${icon('right')}</button>
        </div>
        <div class="cal">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="dow">${d}</div>`).join('')}${cells}</div>
        <div class="legend small muted"><span><i class="dot" style="--c:var(--danger)"></i>Deadline</span><span><i class="dot" style="--c:var(--warn)"></i>Task due</span><span><i class="dot" style="--c:var(--accent)"></i>Event</span><span><u>12</u> Planned</span></div>
      </div>
    </div>
    <div>
      ${dayPanel(state.calDay, idx)}
      <div class="card">
        <div class="card-head"><h3>Upcoming</h3></div>
        ${upcoming.length ? `<div class="list">${upcoming.map((e) => eventRow(e, true)).join('')}</div>` : empty('Nothing upcoming', 'Add meetings, launches and deadlines.')}
      </div>
    </div>
  </div>`;
}

function scheduleWeek() {
  const start = weekStart(state.calDay);
  const idx = scheduleIndex();
  const t = today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const range = `${fmtDate(days[0], { month: 'short', day: 'numeric' })} – ${fmtDate(days[6], { month: 'short', day: 'numeric', year: 'numeric' })}`;
  return `<div class="cal-head">
      <h3>${range}</h3>
      <button class="icon-btn" data-week="-1" aria-label="Previous week">${icon('left')}</button>
      <button class="btn sm ghost" data-action="cal-today">This week</button>
      <button class="icon-btn" data-week="1" aria-label="Next week">${icon('right')}</button>
    </div>
    <div class="week">${days.map((iso) => {
      const evs = sortEvents(idx.byDay[iso] || []);
      const tasks = idx.tasksByDay[iso] || [];
      return `<div class="card week-day ${iso === t ? 'is-today' : ''} ${iso < t ? 'past' : ''}">
        <div class="card-head"><h3>${fmtDate(iso, { weekday: 'short' })} <span class="muted">${fromISO(iso).getDate()}</span></h3>
          <button class="icon-btn bare" data-add-day="${iso}" aria-label="Add event on ${fmtDate(iso)}">${icon('plus')}</button></div>
        ${db.plans[iso] ? `<div class="plan-snippet clip small" data-day="${iso}" data-go-month>${esc(db.plans[iso])}</div>` : ''}
        ${evs.length || tasks.length ? `<div class="list">${evs.map((e) => eventRow(e)).join('')}${tasks.map(taskRow).join('')}</div>`
          : `<button class="link small muted plan-link" data-day="${iso}" data-go-month>Plan this day →</button>`}
      </div>`;
    }).join('')}</div>`;
}

function scheduleDeadlines() {
  const t = today();
  const items = [
    ...byVenture(db.events).filter(isDeadline).map((e) => ({ date: e.date, html: deadlineRow(e.date, e.title, `${eventTypeLabel(e.type)} ${ventureBadge(e.venture)}`, `events:${e.id}`) })),
    ...byVenture(db.tasks).filter((x) => !x.done && x.due).map((x) => ({ date: x.due, html: deadlineRow(x.due, x.title, `Task · ${(x.priority || 'p3').toUpperCase()} ${ventureBadge(x.venture)}`, `tasks:${x.id}`) })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const groups = [
    ['Overdue', (d) => d < t],
    ['Next 7 days', (d) => d >= t && d <= addDays(t, 7)],
    ['Next 30 days', (d) => d > addDays(t, 7) && d <= addDays(t, 30)],
    ['Later', (d) => d > addDays(t, 30)],
  ].map(([name, fn]) => [name, items.filter((i) => fn(i.date))]).filter(([, l]) => l.length);
  if (!groups.length) return empty('No deadlines', 'Add launches, investor updates, filing dates… Tap “+ Deadline”.');
  return groups.map(([name, list]) => `<div class="section"><p class="section-title">${name} · ${list.length}</p>
    <div class="card" style="padding:4px 12px"><div class="list">${list.map((i) => i.html).join('')}</div></div></div>`).join('');
}

function deadlineRow(date, title, meta, edit) {
  const days = Math.round((fromISO(date) - fromISO(today())) / 864e5);
  const tone = days < 0 ? 'danger' : days <= 2 ? 'warn' : days <= 7 ? '' : 'ok';
  const label = days < 0 ? `${-days}d late` : days === 0 ? 'Today' : `${days}d`;
  return `<div class="item">
    <span class="countdown badge ${tone}">${label}</span>
    <div class="item-main" data-edit="${edit}">
      <div class="item-title">${esc(title)}</div>
      <div class="item-meta">${fmtDate(date)} · ${meta}</div>
    </div>
  </div>`;
}

function exportICS() {
  const stamp = (date, time) => date.replace(/-/g, '') + (time ? 'T' + time.replace(':', '') + '00' : '');
  const escICS = (s) => String(s || '').replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lumid HQ//EN'];
  byVenture(db.events).forEach((e) => {
    lines.push('BEGIN:VEVENT', `UID:${e.id}@lumid-hq`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`);
    if (e.start) {
      lines.push(`DTSTART:${stamp(e.date, e.start)}`, `DTEND:${stamp(e.date, e.end || e.start)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${stamp(e.date)}`, `DTEND;VALUE=DATE:${stamp(addDays(e.date, 1))}`);
    }
    lines.push(`SUMMARY:${escICS(e.title)}`, `DESCRIPTION:${escICS([e.venture, e.notes].filter(Boolean).join(' — '))}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  download('lumid-hq-schedule.ics', lines.join('\r\n'), 'text/calendar');
}

/* ---------- View: Goals ---------- */
const goalProgress = (g) => g.keyResults?.length ? Math.round(g.keyResults.reduce((s, k) => s + (Number(k.progress) || 0), 0) / g.keyResults.length) : 0;

function viewGoals() {
  const goals = byVenture(db.goals);
  if (!goals.length) return empty('No goals set', 'Define this quarter’s objectives and key results. Tap +.');
  return `<div class="grid two">${goals.map((g) => {
    const p = goalProgress(g);
    return `<div class="card">
      <div class="row" style="flex-wrap:nowrap;align-items:flex-start">
        <div class="item-main" data-edit="goals:${g.id}">
          <h3 style="font-size:16px">${esc(g.title)}</h3>
          <div class="row" style="margin-top:4px">${ventureBadge(g.venture)}<span class="small muted">${esc(g.quarter || '')}</span></div>
        </div>
        <div class="ring" style="--p:${p}"><span>${p}%</span></div>
      </div>
      ${(g.keyResults || []).map((k, i) => `
        <div class="kr">
          <div class="kr-row"><span>${esc(k.text)}</span><b>${k.progress || 0}%</b></div>
          <input type="range" min="0" max="100" step="5" value="${k.progress || 0}" data-kr="${g.id}:${i}" aria-label="Progress for ${esc(k.text)}">
        </div>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

/* ---------- View: Metrics ---------- */
const SPARK_TONES = { accent: 'var(--blue)', green: 'var(--ok)' };

// Smooth curve through points (Catmull-Rom → cubic Bézier).
function smoothPath(p) {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [p0, p1, p2, p3] = [p[i - 1] || p[i], p[i], p[i + 1], p[i + 2] || p[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((n) => n.toFixed(2))} ${c2.map((n) => n.toFixed(2))} ${p2.map((n) => n.toFixed(2))}`;
  }
  return d;
}

function sparkline(values, { tone = 'accent', grid = false } = {}) {
  if (values.length < 2) return '';
  const color = SPARK_TONES[tone] || SPARK_TONES.accent;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 34 - ((v - min) / range) * 30]);
  const line = smoothPath(pts);
  const gridLines = grid ? [20, 40, 60, 80].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="36" class="spark-grid" vector-effect="non-scaling-stroke"/>`).join('') : '';
  return `<svg class="spark" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
    ${gridLines}
    <path d="${line} L100,36 L0,36 Z" style="fill:${color};fill-opacity:.08"/>
    <path d="${line}" fill="none" style="stroke:${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

const METRIC_RANGES = [['30d', 'Last 30 days', 30], ['6m', 'Last 6 months', 183], ['all', 'All time', Infinity]];
const inRange = (entries) => {
  const days = (METRIC_RANGES.find(([k]) => k === state.metricRange) || METRIC_RANGES[1])[2];
  if (days === Infinity) return entries;
  const from = addDays(today(), -days);
  return entries.filter((e) => e.date >= from);
};
const metricValue = (m, v) => {
  const u = (m.unit || '').trim();
  if (['$', '€', '£', '₹'].includes(u)) return u + fmtNum(v);
  if (u === '%') return fmtNum(v) + '%';
  return u ? `${fmtNum(v)} <small class="muted" style="font-size:13px">${esc(u)}</small>` : fmtNum(v);
};
function metricDelta(m) {
  const e = sortedEntries(m);
  if (e.length < 2) return '';
  const a = e[e.length - 2].value, b = e[e.length - 1].value;
  if (!a) return '';
  const pct = ((b - a) / Math.abs(a)) * 100;
  return `<span class="delta ${pct >= 0 ? 'up' : 'down'}">${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%</span>`;
}
const sortedEntries = (m) => [...(m.entries || [])].sort((a, b) => a.date.localeCompare(b.date));

function metricTile(m, wide = false) {
  const e = sortedEntries(m);
  const last = e.at(-1);
  const money = ['$', '€', '£', '₹'].includes((m.unit || '').trim());
  const glyph = money ? 'coins' : /user|people|customer|member/i.test(m.name) ? 'people' : 'metrics';
  const range = wide
    ? `<select class="range-select" data-metric-range aria-label="Chart range">${METRIC_RANGES.map(([k, l]) => `<option value="${k}" ${k === state.metricRange ? 'selected' : ''}>${l}</option>`).join('')}</select>`
    : '';
  const series = (wide ? inRange(e) : e).map((x) => x.value);
  return `<div class="tile card click metric-tile ${wide ? 'wide' : ''}" data-log="${m.id}">
    ${tileHead(esc(m.name), glyph, range)}
    <div class="tile-body">
      <div><div class="value">${last ? metricValue(m, last.value) : '—'}</div><div class="delta">${metricDelta(m) || '<span class="muted">log a value</span>'}</div></div>
      ${sparkline(series, { tone: money ? 'green' : 'accent', grid: wide })}
    </div>
  </div>`;
}

function viewMetrics() {
  const metrics = byVenture(db.metrics);
  if (!metrics.length) return empty('No KPIs tracked', 'Add MRR, users, runway, burn… Tap +.');
  return `<div class="grid two">${metrics.map((m) => {
    const e = sortedEntries(m);
    const last = e.at(-1);
    const pct = m.target && last ? clamp(Math.round((last.value / m.target) * 100), 0, 100) : null;
    return `<div class="card">
      <div class="card-head"><span class="dot" style="--c:${ventureColor(m.venture)}"></span><h3>${esc(m.name)}</h3>
        <button class="link" data-edit="metrics:${m.id}">Edit</button></div>
      <div class="row" style="align-items:baseline"><span class="tile value" style="border:0;padding:0;background:none">${last ? metricValue(m, last.value) : '—'}</span>${metricDelta(m)}</div>
      ${sparkline(e.map((x) => x.value))}
      ${pct !== null ? `<div class="kr"><div class="kr-row"><span class="muted">Target ${metricValue(m, m.target)}</span><b>${pct}%</b></div><div class="progress"><span style="width:${pct}%"></span></div></div>` : ''}
      <div class="row" style="margin-top:12px">
        <span class="small muted">${e.length} entries${last ? ' · last ' + relDate(last.date).toLowerCase() : ''}</span><span class="spacer"></span>
        <button class="btn sm" data-log="${m.id}">${icon('plus')} Log value</button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function openLog(id) {
  const m = find('metrics', id);
  if (!m) return;
  const recent = sortedEntries(m).slice(-5).reverse();
  openModal(`Log · ${esc(m.name)}`, `
    <form id="log-form" data-form="log" data-id="${id}">
      <div class="field-row">
        <div class="field"><label>Value</label><input type="number" step="any" name="value" required inputmode="decimal" autofocus></div>
        <div class="field"><label>Date</label><input type="date" name="date" value="${today()}" required></div>
      </div>
    </form>
    ${recent.length ? `<p class="section-title">Recent</p><div class="list">${recent.map((r) => `<div class="item"><span class="item-main">${fmtDate(r.date)}</span><b>${metricValue(m, r.value)}</b></div>`).join('')}</div>` : ''}`,
  `<button class="btn ghost" data-action="close">Cancel</button><span class="spacer"></span><button class="btn" type="submit" form="log-form">Save</button>`);
}

/* ---------- View: Decisions ---------- */
function viewDecisions() {
  const list = byVenture(db.decisions).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!list.length) return empty('Decision log is empty', 'Record key calls & why you made them — your future self will thank you.');
  return `<div class="card" style="padding:4px 16px"><div class="list">${list.map((d) => `
    <div class="item"><div class="item-main" data-edit="decisions:${d.id}">
      <div class="item-title">${esc(d.title)}</div>
      ${d.rationale ? `<div class="clip small muted" style="margin-top:4px">${esc(d.rationale)}</div>` : ''}
      <div class="item-meta">${d.date ? fmtDate(d.date) : ''} ${ventureBadge(d.venture)} ${d.review ? `<span class="badge ${d.review <= today() ? 'warn' : ''}">Review ${relDate(d.review).toLowerCase()}</span>` : ''}</div>
    </div></div>`).join('')}</div></div>`;
}

/* ---------- View: People ---------- */
function viewPeople() {
  const list = byVenture(db.people).sort((a, b) => (a.followUp || '9999').localeCompare(b.followUp || '9999'));
  if (!list.length) return empty('No contacts yet', 'Investors, advisors, hires, partners — track who to follow up with.');
  return `<div class="card" style="padding:4px 16px"><div class="list">${list.map((p) => `
    <div class="item">
      <div class="avatar" style="--c:${ventureColor(p.venture)}">${esc((p.name || '?').trim().charAt(0).toUpperCase())}</div>
      <div class="item-main" data-edit="people:${p.id}">
        <div class="item-title">${esc(p.name)}</div>
        <div class="item-meta">${[p.role, p.company].filter(Boolean).map(esc).join(' · ')} ${p.followUp ? `<span class="badge ${p.followUp <= today() ? 'warn' : ''}">Follow up ${relDate(p.followUp).toLowerCase()}</span>` : ''}</div>
      </div>
      ${p.email ? `<a class="icon-btn bare" href="mailto:${esc(p.email)}" aria-label="Email ${esc(p.name)}">✉️</a>` : ''}
    </div>`).join('')}</div></div>`;
}

/* ---------- View: Resources ---------- */
const PLATFORMS = {
  youtube: { label: 'YouTube', emoji: '▶️', color: '#ff4d4d' },
  reel: { label: 'Instagram', emoji: '📸', color: '#e1306c' },
  tiktok: { label: 'TikTok', emoji: '🎵', color: '#25f4ee' },
  x: { label: 'X', emoji: '𝕏', color: '#8d94a8' },
  linkedin: { label: 'LinkedIn', emoji: '💼', color: '#0a66c2' },
  podcast: { label: 'Podcast', emoji: '🎧', color: '#9be15d' },
  link: { label: 'Article', emoji: '🔗', color: '#5aa9ff' },
};
const URL_RE = /https?:\/\/[^\s]+/i;

function normalizeUrl(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  const url = /^https?:\/\//i.test(s) ? s : 'https://' + s;
  try { return new URL(url).href; } catch { return ''; }
}

function detectPlatform(url) {
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\.|^m\./, ''); } catch { return 'link'; }
  if (/youtube\.com$|youtu\.be$/.test(host)) return 'youtube';
  if (/instagram\.com$/.test(host)) return 'reel';
  if (/tiktok\.com$/.test(host)) return 'tiktok';
  if (/(^|\.)x\.com$|twitter\.com$/.test(host)) return 'x';
  if (/linkedin\.com$/.test(host)) return 'linkedin';
  if (/spotify\.com$|podcasts\.apple\.com$/.test(host)) return 'podcast';
  return 'link';
}

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/);
    return m ? m[2] : '';
  } catch { return ''; }
}

const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Best-effort title lookup; the link is saved regardless.
async function fetchTitle(res) {
  try {
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(res.url)}`);
    const data = await r.json();
    const cur = find('resources', res.id);
    if (data.title && cur && cur.title === res.title) {
      cur.title = data.title;
      if (data.author_name && !cur.author) cur.author = data.author_name;
      store.save();
      render();
    }
  } catch {}
}

function addResource(url, title = '', extra = {}) {
  const href = normalizeUrl(url);
  if (!href) return toast('That link doesn’t look valid');
  const platform = detectPlatform(href);
  const res = { id: uid(), url: href, platform, title: title || `${PLATFORMS[platform].label} · ${hostOf(href)}`, status: 'watch', venture: state.venture !== 'All' ? state.venture : 'General', notes: '', createdAt: Date.now(), ...extra };
  upsert('resources', res);
  if (!title) fetchTitle(res);
  return res;
}

function resourceCard(r) {
  const p = PLATFORMS[r.platform] || PLATFORMS.link;
  const yt = r.platform === 'youtube' && youtubeId(r.url);
  const done = r.status === 'done';
  return `<div class="card res ${done ? 'is-done' : ''}">
    <a class="thumb" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" style="--c:${p.color}" aria-label="Open ${esc(r.title)}">
      <span class="thumb-emoji">${p.emoji}</span>
      ${yt ? `<img src="https://i.ytimg.com/vi/${encodeURIComponent(yt)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">` : ''}
      <span class="thumb-tag">${p.label}</span>
    </a>
    <div class="item-main" data-edit="resources:${r.id}">
      <div class="idea-title clip2">${esc(r.title)}</div>
      <div class="small muted">${esc(r.author || hostOf(r.url))}</div>
      ${r.notes ? `<div class="clip small muted" style="margin-top:4px">${esc(r.notes)}</div>` : ''}
    </div>
    <div class="row" style="margin-top:8px">
      ${ventureBadge(r.venture)}<span class="spacer"></span>
      <button class="btn sm ${done ? 'ghost' : ''}" data-res-done="${r.id}">${done ? 'Watched ✓' : 'Mark watched'}</button>
    </div>
  </div>`;
}

function viewResources() {
  const q = state.resQuery.toLowerCase();
  const all = byVenture(db.resources);
  const tab = state.resTab;
  const list = all
    .filter((r) => tab === 'all' || r.status === tab)
    .filter((r) => !q || [r.title, r.notes, r.url, r.author].join(' ').toLowerCase().includes(q))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const count = (k) => all.filter((r) => k === 'all' || r.status === k).length;
  const seg = `<div class="seg">${[...RES_STATUS, ['all', 'All']].map(([k, l]) => `<button class="${tab === k ? 'active' : ''}" data-res-tab="${k}">${l} <span class="muted">${count(k)}</span></button>`).join('')}</div>`;
  return `<form class="capture section" data-form="res-add">
      <input type="text" name="url" placeholder="Paste a reel, YouTube or article link…" autocomplete="off" inputmode="url" aria-label="Paste link" required>
      <button class="btn" type="submit">Save</button>
    </form>
    <div class="toolbar">${seg}<input type="search" data-res-search placeholder="Search resources…" value="${esc(state.resQuery)}" aria-label="Search resources"></div>
    ${list.length ? `<div class="grid cards">${list.map(resourceCard).join('')}</div>`
      : empty(q ? 'No matching resources' : 'Nothing here yet', 'Paste links to reels, YouTube videos, podcasts or articles to watch later. Tip: on Android, share straight to Lumid HQ once installed.')}`;
}

/* ---------- View: Settings ---------- */
function viewSettings() {
  const counts = VIEWS.filter((v) => v.col).map((v) => `${db[v.col].length} ${v.label.toLowerCase()}`).join(' · ');
  return `<div class="grid two">
    <div class="card">
      <div class="card-head"><h3>Ventures</h3></div>
      <p class="small muted">Your companies & workstreams. Comma-separated. Use <code>#lastword</code> in quick capture to tag.</p>
      <form data-form="ventures" class="capture">
        <input type="text" name="ventures" value="${esc(db.ventures.join(', '))}" aria-label="Ventures">
        <button class="btn" type="submit">Save</button>
      </form>
    </div>
    <div class="card">
      <div class="card-head">${appIcon('sparkle', '', 'sparkle')}<h3>AI assistant</h3></div>
      ${aiCard()}
    </div>
    <div class="card">
      <div class="card-head"><h3>☁️ Cloud sync</h3></div>
      ${cloudCard()}
    </div>
    <div class="card">
      <div class="card-head"><h3>Backup</h3></div>
      <p class="small muted">Data is always saved on this device (${counts}). Export regularly or move it to another device.</p>
      <div class="row">
        <button class="btn ghost" data-action="export">${icon('download')} Export JSON</button>
        <label class="btn ghost">${icon('upload')} Import<input type="file" accept="application/json" data-import hidden></label>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Install on your phone</h3></div>
      <p class="small muted">iPhone: Safari → Share → <b>Add to Home Screen</b>.<br>Android: Chrome → ⋮ → <b>Install app</b>.<br>Works offline once installed.</p>
    </div>
    <div class="card">
      <div class="card-head"><h3>Danger zone</h3></div>
      <div class="row">
        <button class="btn danger" data-action="reset">Erase all data</button>
        <button class="btn ghost" data-action="demo">Load demo data</button>
      </div>
    </div>
  </div>`;
}

const RENDERERS = { today: viewToday, ideas: viewIdeas, tasks: viewTasks, notes: viewNotes, resources: viewResources, schedule: viewSchedule, goals: viewGoals, metrics: viewMetrics, decisions: viewDecisions, people: viewPeople, settings: viewSettings };

/* ---------- Modal & generic editor ---------- */
const modal = $('#modal');

function openModal(title, body, foot) {
  modal.innerHTML = `
    <div class="modal-head"><h2>${title}</h2><button class="icon-btn bare" data-action="close" aria-label="Close">${icon('close')}</button></div>
    <div class="modal-body">${body}</div>
    ${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
  if (!modal.open) modal.showModal();
  const first = $('[autofocus], input:not([type=hidden]):not([type=checkbox]):not([type=range]), textarea', modal);
  if (first && window.matchMedia('(min-width: 901px)').matches) first.focus();
}
const closeModal = () => modal.open && modal.close();

function fieldHTML(f, item) {
  const raw = item[f.k] ?? (typeof f.def === 'function' ? f.def() : f.def) ?? '';
  const id = `f-${f.k}`;
  const req = f.req ? 'required' : '';
  const ph = f.ph ? `placeholder="${esc(f.ph)}"` : '';
  let input;
  switch (f.type) {
    case 'textarea':
      input = `<textarea id="${id}" name="${f.k}" ${ph} class="${f.tall ? 'tall' : ''}">${esc(raw)}</textarea>`; break;
    case 'krs':
      input = `<textarea id="${id}" name="${f.k}" ${ph}>${esc((raw || []).map((k) => k.text).join('\n'))}</textarea>`; break;
    case 'venture':
      input = `<select id="${id}" name="${f.k}">${db.ventures.map((v) => `<option ${v === (raw || (state.venture !== 'All' ? state.venture : db.ventures[0])) ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>`; break;
    case 'select':
      input = `<select id="${id}" name="${f.k}">${f.options.map(([v, l]) => `<option value="${v}" ${v === raw ? 'selected' : ''}>${l}</option>`).join('')}</select>`; break;
    case 'range':
      return `<div class="field"><label for="${id}">${f.label}<span class="range-val">${raw}</span></label><input type="range" id="${id}" name="${f.k}" min="${f.min}" max="${f.max}" value="${raw}" oninput="this.previousElementSibling.lastChild.textContent=this.value"></div>`;
    case 'checkbox':
      return `<div class="field"><label>&nbsp;</label><label class="row" style="color:var(--text);font-size:15px"><input type="checkbox" class="check" name="${f.k}" ${raw ? 'checked' : ''}> ${f.label}</label></div>`;
    default:
      input = `<input type="${f.type}" id="${id}" name="${f.k}" value="${esc(raw)}" ${ph} ${req} ${f.type === 'number' ? 'step="any" inputmode="decimal"' : ''} autocomplete="off">`;
  }
  return `<div class="field"><label for="${id}">${f.label}</label>${input}</div>`;
}

function openEditor(col, id, preset = {}, opts = {}) {
  const schema = SCHEMAS[col];
  const item = id ? find(col, id) : preset;
  if (id && !item) return;
  const missing = opts.missing || [];
  const hint = missing.length
    ? `<p class="confirm-note warn">📅 Add ${missing.map((k) => ({ date: 'a date', start: 'a start time', due: 'a due date' }[k] || k)).join(' and ')}${opts.require?.some((k) => missing.includes(k)) ? '' : ' (optional)'}.</p>`
    : opts.confirm ? '<p class="confirm-note">✨ Check the details and confirm.</p>' : '';
  const body = `<form id="editor" data-form="editor" data-col="${col}" data-id="${id || ''}">
    ${hint}
    ${schema.fields.map((f) => f.row ? `<div class="field-row">${f.row.map((x) => fieldHTML(x, item)).join('')}</div>` : fieldHTML(f, item)).join('')}
  </form>`;
  const foot = `${id ? `<button class="btn danger" data-action="delete" data-col="${col}" data-id="${id}" aria-label="Delete">${icon('trash')}</button>` : ''}
    <span class="spacer"></span>
    <button class="btn ghost" type="button" data-action="close">Cancel</button>
    <button class="btn" type="submit" form="editor">${id ? 'Save' : 'Add ' + schema.label.toLowerCase()}</button>`;
  openModal(`${id ? 'Edit' : opts.confirm ? 'Confirm' : 'New'} ${schema.label.toLowerCase()}`, body, foot);
  missing.forEach((k) => {
    const el = $(`#f-${k}`, modal);
    if (!el) return;
    el.classList.add('missing');
    if (opts.require?.includes(k)) el.required = true;
  });
}

function saveEditor(form) {
  const col = form.dataset.col;
  const id = form.dataset.id;
  const existing = id ? find(col, id) : null;
  const item = existing ? { ...existing } : { id: uid(), createdAt: Date.now() };
  const fd = new FormData(form);
  const flat = SCHEMAS[col].fields.flatMap((f) => f.row || [f]);
  for (const f of flat) {
    const v = fd.get(f.k);
    if (f.type === 'checkbox') item[f.k] = v === 'on';
    else if (f.type === 'range') item[f.k] = Number(v);
    else if (f.type === 'number') item[f.k] = v === '' ? null : Number(v);
    else if (f.type === 'krs') {
      const prev = existing?.keyResults || [];
      item.keyResults = String(v).split('\n').map((s) => s.trim()).filter(Boolean)
        .map((text, i) => ({ text, progress: (prev.find((k) => k.text === text) || prev[i] || {}).progress || 0 }));
    } else item[f.k] = String(v ?? '').trim();
  }
  if (col === 'resources') {
    item.url = normalizeUrl(item.url);
    if (!item.url) return toast('That link doesn’t look valid');
    item.platform = detectPlatform(item.url);
    item.title ||= `${PLATFORMS[item.platform].label} · ${hostOf(item.url)}`;
  }
  if (col === 'notes') item.updatedAt = Date.now();
  if (col === 'tasks' && item.done === undefined) item.done = false;
  if (col === 'metrics' && !item.entries) item.entries = [];
  upsert(col, item);
  closeModal();
  render();
  toast(`${SCHEMAS[col].label} saved`);
}

/* ---------- Search ---------- */
function openSearch() {
  openModal('Search', `<input type="search" class="search-input" id="search-q" placeholder="Search everything…" autocomplete="off" autofocus aria-label="Search everything"><div class="results" id="search-results"></div>`);
  const input = $('#search-q');
  input.focus();
  runSearch('');
}

function runSearch(q) {
  const needle = q.trim().toLowerCase();
  const results = [];
  for (const v of VIEWS.filter((x) => x.col)) {
    for (const item of db[v.col]) {
      const text = [item.title, item.name, item.body, item.notes, item.context, item.rationale, item.company, item.role].filter(Boolean).join(' ');
      if (!needle || text.toLowerCase().includes(needle)) results.push({ col: v.col, kind: SCHEMAS[v.col].label, item });
    }
  }
  const html = results.slice(0, needle ? 40 : 0).map(({ col, kind, item }) => `
    <button class="result" data-edit="${col}:${item.id}"><span class="kind">${kind}</span><span class="item-main">${esc(item.title || item.name)}</span>${ventureBadge(item.venture)}</button>`).join('');
  $('#search-results').innerHTML = html || (needle
    ? `<p class="muted small">No results for “${esc(q)}”.</p>`
    : `<div class="more-grid">${VIEWS.map((v) => `<button class="nav-link" data-nav="${v.id}">${appIcon(v.id, 'lg')}${v.label}</button>`).join('')}</div>`);
}

function openMore() {
  openModal('More', `<div class="more-grid">${VIEWS.filter((v) => !MOBILE_TABS.includes(v.id)).map((v) => `<button class="nav-link" data-nav="${v.id}">${appIcon(v.id, 'lg')}${v.label}</button>`).join('')}</div>`);
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, actionLabel, onAction) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : ''}`;
  if (actionLabel) $('button', el).onclick = () => { el.classList.remove('show'); onAction(); };
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), actionLabel ? 5000 : 2200);
}

/* ---------- Files ---------- */
function download(name, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importJSON(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.ventures)) throw new Error('bad file');
    if (!confirm('Replace all current data with this backup?')) return;
    db = { ...emptyDb(), ...data };
    store.save();
    render();
    toast('Backup restored');
  } catch { toast('That file is not a valid Lumid HQ backup'); }
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#0e0e11' : '#ffffff';
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
}

/* ---------- Events ---------- */
const ACTIONS = {
  search: openSearch,
  more: openMore,
  close: closeModal,
  theme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  },
  fab() {
    const v = VIEWS.find((x) => x.id === state.view);
    if (v.col) openEditor(v.col);
    else { const input = $('[data-form="capture"] input'); input ? input.focus() : openEditor('ideas'); }
  },
  delete: (el) => { closeModal(); remove(el.dataset.col, el.dataset.id); },
  'idea-to-task': (el) => ideaToTask(el.dataset.id),
  'new-event': () => openEditor('events'),
  'new-deadline': () => openEditor('events', null, { type: 'deadline' }),
  'cal-today': () => { state.calMonth = today().slice(0, 7); state.calDay = today(); render(); },
  'clear-done': () => {
    if (!confirm('Remove all completed tasks?')) return;
    const ids = new Set(byVenture(db.tasks).filter((t) => t.done).map((t) => t.id));
    db.tasks = db.tasks.filter((t) => !ids.has(t.id));
    store.save(); render();
  },
  ics: exportICS,
  export: () => download(`lumid-hq-backup-${today()}.json`, JSON.stringify(db, null, 2)),
  reset: () => {
    if (!confirm('Erase ALL data on this device? Export a backup first if unsure.')) return;
    db = emptyDb(); store.save(); render(); toast('All data erased');
  },
  'cloud-sync': () => cloud.pull(),
  voice: toggleVoice,
  'ai-test': async (el) => {
    el.disabled = true;
    try {
      const { items } = await aiOrganize({ text: 'Call Arjun tomorrow at 3pm about the Lumid AI launch, and idea: a voice mode for Lumid Studio' });
      toast(`AI works ✓ — found ${items.length} items`);
    } catch (err) { toast(`AI: ${err.message}`); }
    el.disabled = false;
  },
  'cloud-signout': () => cloud.signOut(),
  'cloud-disconnect': () => { if (confirm('Disconnect cloud sync on this device? Your data stays here and in the cloud.')) cloud.disconnect(); },
  demo: () => {
    if (!confirm('Replace current data with demo data?')) return;
    db = seed(); store.save(); render();
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action],[data-nav],[data-venture],[data-edit],[data-day],[data-month],[data-log],[data-tasks-tab],[data-cal-mode],[data-week],[data-add-day],[data-res-tab],[data-res-done],[data-cap-type],[data-cap-token]');
  if (!el || e.target.closest('select, input[type=checkbox], input[type=range]')) return;
  const d = el.dataset;
  if (d.action) return ACTIONS[d.action]?.(el);
  if (d.nav) { closeModal(); return go(d.nav); }
  if (d.venture) { state.venture = d.venture; return render(); }
  if (d.log) return openLog(d.log);
  if (d.edit) { const [col, id] = d.edit.split(':'); return openEditor(col, id); }
  if (d.capType) return setCaptureType(d.capType);
  if (d.capToken) return addCaptureToken(d.capToken);
  if (d.calMode) { state.calMode = d.calMode; return render(); }
  if (d.week) { state.calDay = addDays(state.calDay, 7 * Number(d.week)); state.calMonth = state.calDay.slice(0, 7); return render(); }
  if (d.addDay) { state.calDay = d.addDay; return openEditor('events'); }
  if (d.resTab) { state.resTab = d.resTab; return render(); }
  if (d.resDone) {
    const r = find('resources', d.resDone);
    if (r) { r.status = r.status === 'done' ? 'watch' : 'done'; store.save(); render(); }
    return;
  }
  if (d.day) {
    if ('goMonth' in d) { state.calMode = 'month'; if (state.view !== 'schedule') go('schedule'); }
    state.calDay = d.day;
    state.calMonth = d.day.slice(0, 7);
    return render();
  }
  if (d.month) {
    const [y, m] = state.calMonth.split('-').map(Number);
    state.calMonth = toISO(new Date(y, m - 1 + Number(d.month), 1)).slice(0, 7);
    return render();
  }
  if (d.tasksTab) { state.tasksTab = d.tasksTab; return render(); }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.toggle) {
    const t = find('tasks', el.dataset.toggle);
    if (!t) return;
    t.done = el.checked;
    t.doneAt = t.done ? Date.now() : null;
    store.save();
    if (t.done) toast('Task completed ✓', 'Undo', () => { t.done = false; t.doneAt = null; store.save(); render(); });
    setTimeout(render, t.done ? 350 : 0);
  } else if (el.id === 'ai-provider') {
    const p = AI_PROVIDERS[el.value];
    $('#ai-model').placeholder = p.model;
    $('label[for="ai-key"] a').href = p.keyUrl;
  } else if (el.matches('[data-metric-range]')) {
    state.metricRange = el.value;
    render();
  } else if (el.dataset.stage) {
    const i = find('ideas', el.dataset.stage);
    if (i) { i.stage = el.value; store.save(); render(); }
  } else if (el.dataset.kr) {
    const [gid, idx] = el.dataset.kr.split(':');
    const g = find('goals', gid);
    if (g) { g.keyResults[idx].progress = Number(el.value); store.save(); render(); }
  } else if (el.matches('[data-import]') && el.files[0]) {
    importJSON(el.files[0]);
    el.value = '';
  }
});

let planTimer;
document.addEventListener('input', (e) => {
  const searchAttr = ['data-notes-search', 'data-res-search'].find((a) => e.target.hasAttribute(a));
  if (searchAttr) {
    state[searchAttr === 'data-notes-search' ? 'notesQuery' : 'resQuery'] = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const input = $(`[${searchAttr}]`);
    input.focus();
    input.setSelectionRange(pos, pos);
  } else if (e.target.closest('[data-form="capture"]')) {
    syncCapturePills(e.target);
  } else if (e.target.dataset.plan) {
    const v = e.target.value.trim();
    if (v) db.plans[e.target.dataset.plan] = e.target.value; else delete db.plans[e.target.dataset.plan];
    clearTimeout(planTimer);
    planTimer = setTimeout(() => store.save(), 400);
  } else if (e.target.id === 'search-q') {
    runSearch(e.target.value);
  } else if (e.target.dataset.kr) {
    e.target.previousElementSibling.querySelector('b').textContent = e.target.value + '%';
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!form.dataset.form) return;
  e.preventDefault();
  switch (form.dataset.form) {
    case 'capture': {
      const input = form.elements.q;
      const text = input.value.trim();
      if (!text) break;
      if (ai.ready && ai.cfg.auto && !CAP_PREFIX_RE.test(text) && !URL_RE.test(text)) { aiCapture({ text }); break; }
      if (capture(text) !== 'confirm') input.value = '';
      break;
    }
    case 'editor': saveEditor(form); break;
    case 'res-add': {
      if (addResource(form.elements.url.value)) { form.reset(); state.resTab = 'watch'; render(); toast('Saved to watch list'); }
      break;
    }
    case 'day-add': {
      const input = form.elements.q;
      if (!input.value.trim()) break;
      capture(input.value, form.dataset.date, 'tasks');
      input.value = '';
      break;
    }
    case 'log': {
      const m = find('metrics', form.dataset.id);
      const fd = new FormData(form);
      (m.entries ||= []).push({ date: fd.get('date'), value: Number(fd.get('value')) });
      store.save(); closeModal(); render(); toast(`${m.name} logged`);
      break;
    }
    case 'ai-review': saveAiReview(form); break;
    case 'ai-config': {
      const fd = new FormData(form);
      Object.assign(ai.cfg, { provider: fd.get('provider'), model: String(fd.get('model')).trim(), key: String(fd.get('key')).trim(), auto: fd.get('auto') === 'on' });
      ai.save();
      render();
      toast(ai.ready ? 'AI assistant saved' : 'AI turned off (no key)');
      break;
    }
    case 'cloud-config':
      cloud.connect(form.elements.url.value, form.elements.key.value);
      break;
    case 'cloud-auth': {
      const create = e.submitter?.value === 'signup';
      cloud.signIn(form.elements.email.value.trim(), form.elements.password.value, create);
      break;
    }
    case 'ventures': {
      const list = [...new Set(form.elements.ventures.value.split(',').map((s) => s.trim()).filter(Boolean))];
      if (!list.length) return toast('Add at least one venture');
      db.ventures = list;
      if (!list.includes(state.venture)) state.venture = 'All';
      store.save(); render(); toast('Ventures updated');
      break;
    }
  }
});

// Drag & drop ideas between stages (desktop); mobile uses the stage selector.
document.addEventListener('dragstart', (e) => {
  const card = e.target.closest?.('[data-drag]');
  if (card) e.dataTransfer.setData('text/plain', card.dataset.drag);
});
document.addEventListener('dragover', (e) => {
  const col = e.target.closest?.('[data-drop]');
  if (!col) return;
  e.preventDefault();
  $$('.col.drag-over').forEach((c) => c !== col && c.classList.remove('drag-over'));
  col.classList.add('drag-over');
});
document.addEventListener('drop', (e) => {
  const col = e.target.closest?.('[data-drop]');
  if (!col) return;
  e.preventDefault();
  const idea = find('ideas', e.dataTransfer.getData('text/plain'));
  if (idea) { idea.stage = col.dataset.drop; store.save(); }
  render();
});
document.addEventListener('dragend', () => $$('.col.drag-over').forEach((c) => c.classList.remove('drag-over')));

// Close modal on backdrop tap
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (modal.open || e.target.closest('input, textarea, select')) return;
  const keys = { n: () => ACTIONS.fab(), '/': openSearch, g: () => go('today') };
  if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  const idx = Number(e.key) - 1;
  if (idx >= 0 && idx < VIEWS.length) go(VIEWS[idx].id);
});

// Sync across tabs
window.addEventListener('storage', (e) => { if (e.key === STORE_KEY) { db = store.load(); render(); } });

/* ---------- Cloud sync (optional, Supabase) ---------- */
// Local-first: localStorage is the source of truth on each device; the whole
// dataset is mirrored to one row per user. Conflicts resolve last-write-wins.
const CLOUD_KEY = 'lumid-hq-cloud';
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SYNC_LABELS = { off: '', 'signed-out': 'Sign in to sync', syncing: 'Syncing…', synced: 'Synced', offline: 'Offline', error: 'Sync error' };

const cloud = {
  cfg: {},
  client: null,
  user: null,
  status: 'off',
  timer: null,

  load() { try { this.cfg = JSON.parse(localStorage.getItem(CLOUD_KEY)) || {}; } catch { this.cfg = {}; } },
  persist() { try { localStorage.setItem(CLOUD_KEY, JSON.stringify(this.cfg)); } catch {} },
  get configured() { return Boolean(this.cfg.url && this.cfg.key); },

  set(status) {
    this.status = status;
    const el = $('#sync-badge');
    el.hidden = status === 'off';
    el.dataset.status = status;
    $('span', el).textContent = SYNC_LABELS[status];
    if (state.view === 'settings' && !modal.open && !document.activeElement?.closest('.view form')) render();
  },

  async init() {
    this.load();
    if (!this.configured) return this.set('off');
    try {
      const { createClient } = await import(SUPABASE_JS);
      this.client = createClient(this.cfg.url, this.cfg.key, { auth: { persistSession: true, storageKey: 'lumid-hq-auth' } });
      const { data } = await this.client.auth.getSession();
      this.user = data.session?.user || null;
      this.client.auth.onAuthStateChange((_event, session) => { this.user = session?.user || null; });
      if (this.user) await this.pull(); else this.set('signed-out');
    } catch { this.set(navigator.onLine ? 'error' : 'offline'); }
  },

  markDirty() {
    if (!this.configured) return;
    this.cfg.dirty = true;
    this.cfg.localUpdatedAt = Date.now();
    this.persist();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.push(), 1500);
  },

  async pull() {
    if (!this.user) return;
    this.set('syncing');
    const { data, error } = await this.client.from('hq_state').select('data, updated_at').eq('user_id', this.user.id).maybeSingle();
    if (error) return this.set(navigator.onLine ? 'error' : 'offline');
    if (!data) return this.push();
    const remoteAt = Date.parse(data.updated_at);
    const remoteNewer = remoteAt > (this.cfg.lastSynced || 0);
    if (remoteNewer && (!this.cfg.dirty || remoteAt > (this.cfg.localUpdatedAt || 0))) {
      db = normalizeDb(data.data);
      saveLocal();
      Object.assign(this.cfg, { lastSynced: remoteAt, dirty: false });
      this.persist();
      render();
      return this.set('synced');
    }
    if (this.cfg.dirty) return this.push();
    this.set('synced');
  },

  async push() {
    if (!this.user) return;
    this.set('syncing');
    const at = this.cfg.localUpdatedAt || Date.now();
    const { error } = await this.client.from('hq_state').upsert({ user_id: this.user.id, data: db, updated_at: new Date(at).toISOString() });
    if (error) return this.set(navigator.onLine ? 'error' : 'offline');
    Object.assign(this.cfg, { lastSynced: at, dirty: false });
    this.persist();
    this.set('synced');
  },

  async signIn(email, password, create) {
    const auth = this.client.auth;
    const { data, error } = create
      ? await auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } })
      : await auth.signInWithPassword({ email, password });
    if (error) return toast(error.message);
    if (!data.session) return toast('Check your email to confirm, then sign in');
    this.user = data.session.user;
    // Fresh sign-in: the cloud copy wins. Keep this device's data as a safety backup.
    try { localStorage.setItem(STORE_KEY + '-presync', JSON.stringify(db)); } catch {}
    Object.assign(this.cfg, { lastSynced: 0, dirty: false });
    this.persist();
    await this.pull();
    render();
    toast(`Signed in as ${this.user.email}`);
  },

  async signOut() {
    await this.client?.auth.signOut();
    this.user = null;
    this.set(this.configured ? 'signed-out' : 'off');
    render();
  },

  async connect(url, key) {
    this.cfg = { url: url.trim().replace(/\/+$/, ''), key: key.trim() };
    this.persist();
    await this.init();
    if (this.status === 'error') toast('Could not reach Supabase — check the URL and key');
    render();
  },

  async disconnect() {
    await this.signOut();
    this.cfg = {};
    this.client = null;
    this.persist();
    this.set('off');
    render();
  },
};

function cloudCard() {
  if (!cloud.configured) {
    return `<p class="small muted">Sync across phone & laptop with a free Supabase database. Setup takes ~5 minutes — see <code>SETUP.md</code> in the repo.</p>
      <form data-form="cloud-config">
        <div class="field"><label for="cloud-url">Supabase project URL</label><input type="text" id="cloud-url" name="url" placeholder="https://xxxx.supabase.co" required autocomplete="off" inputmode="url"></div>
        <div class="field"><label for="cloud-key">Anon / publishable key</label><input type="text" id="cloud-key" name="key" placeholder="eyJhbGciOi… or sb_publishable_…" required autocomplete="off"></div>
        <button class="btn" type="submit">Connect</button>
      </form>`;
  }
  if (!cloud.user) {
    return `<p class="small muted">Connected to <b>${esc(hostOf(cloud.cfg.url))}</b>. Sign in to start syncing.</p>
      <form data-form="cloud-auth">
        <div class="field"><label for="cloud-email">Email</label><input type="email" id="cloud-email" name="email" required autocomplete="email"></div>
        <div class="field"><label for="cloud-pass">Password</label><input type="password" id="cloud-pass" name="password" required minlength="6" autocomplete="current-password"></div>
        <div class="row">
          <button class="btn" type="submit" name="mode" value="signin">Sign in</button>
          <button class="btn ghost" type="submit" name="mode" value="signup">Create account</button>
          <span class="spacer"></span>
          <button class="btn sm ghost" type="button" data-action="cloud-disconnect">Disconnect</button>
        </div>
      </form>`;
  }
  const last = cloud.cfg.lastSynced ? new Date(cloud.cfg.lastSynced).toLocaleString() : 'never';
  return `<p class="small muted">Signed in as <b>${esc(cloud.user.email)}</b><br>Status: ${SYNC_LABELS[cloud.status] || '—'} · last synced ${esc(last)}</p>
    <div class="row">
      <button class="btn" data-action="cloud-sync">Sync now</button>
      <button class="btn ghost" data-action="cloud-signout">Sign out</button>
      <button class="btn sm ghost" data-action="cloud-disconnect">Disconnect</button>
    </div>`;
}

/* ---------- AI assistant (free-tier LLMs, called straight from the browser) ---------- */
// The key is stored only on this device (never synced) and sent only to the chosen provider.
const AI_KEY = 'lumid-hq-ai';
const AI_PROVIDERS = {
  gemini: { label: 'Google Gemini', model: 'gemini-2.5-flash', keyUrl: 'https://aistudio.google.com/apikey', audio: true },
  groq: { label: 'Groq', model: 'llama-3.3-70b-versatile', keyUrl: 'https://console.groq.com/keys', audio: true },
  openrouter: { label: 'OpenRouter (free models)', model: 'meta-llama/llama-3.3-70b-instruct:free', keyUrl: 'https://openrouter.ai/keys', audio: false },
};
const AI_KINDS = { idea: 'ideas', task: 'tasks', event: 'events', note: 'notes', decision: 'decisions', link: 'resources' };

const ai = {
  cfg: { provider: 'gemini', key: '', model: '', auto: true },
  load() { try { Object.assign(this.cfg, JSON.parse(localStorage.getItem(AI_KEY)) || {}); } catch {} },
  save() { try { localStorage.setItem(AI_KEY, JSON.stringify(this.cfg)); } catch {} },
  get ready() { return Boolean(this.cfg.key && AI_PROVIDERS[this.cfg.provider]); },
  get provider() { return AI_PROVIDERS[this.cfg.provider] || AI_PROVIDERS.gemini; },
  get model() { return this.cfg.model || this.provider.model; },
};
ai.load();

function aiPrompt(source) {
  const now = new Date();
  const fallbackVenture = state.venture !== 'All' ? state.venture : 'General';
  return `You organise a CEO's quick notes (typed or spoken) into items for their dashboard.
Today is ${today()} (${now.toLocaleDateString('en-US', { weekday: 'long' })}), local time ${hhmm(now.getHours(), now.getMinutes())}, timezone ${Intl.DateTimeFormat().resolvedOptions().timeZone}.
Ventures: ${db.ventures.join(', ')}. Use "${fallbackVenture}" when none is mentioned.

Return only JSON in this shape:
{"transcript":"what was said, cleaned up","items":[{"kind":"idea|task|event|note|decision|link","title":"short title","body":"extra details or empty","date":"YYYY-MM-DD or empty","start":"HH:MM (24h) or empty","end":"HH:MM or empty","venture":"one of the ventures","priority":"p1|p2|p3","url":"only for links"}]}

Guidelines:
- Split separate things into separate items.
- Something to do ("call", "send", "remind me", "need to") is a task; a meeting or appointment at a time is an event; a product or business thought is an idea; a choice already made is a decision.
- Resolve relative dates and times ("tomorrow 3pm", "next Friday") to absolute values. Leave date/start empty when not stated; an event with a start but no end lasts one hour.
- Fix obvious speech-to-text mistakes and keep titles concise, in the speaker's words.
- "urgent" or "asap" means p1; otherwise p2.
- If nothing is actionable, return a single note.

${source}`;
}

function extractJson(text) {
  const s = String(text || '');
  const start = s.indexOf('{'), end = s.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('The AI did not return JSON');
  return JSON.parse(s.slice(start, end + 1));
}

async function aiFetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || data.error || `AI request failed (${res.status})`);
  return data;
}

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = reject;
  r.readAsDataURL(blob);
});

async function aiGenerate(prompt, audio) {
  const { provider, key } = ai.cfg;
  if (provider === 'gemini') {
    const parts = [{ text: prompt }];
    if (audio) parts.unshift({ inline_data: { mime_type: audio.type.split(';')[0] || 'audio/webm', data: await blobToBase64(audio) } });
    const data = await aiFetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ai.model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
    });
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  }
  const base = provider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1';
  const body = { model: ai.model, temperature: 0.2, messages: [{ role: 'user', content: prompt }] };
  if (provider === 'groq') body.response_format = { type: 'json_object' };
  const data = await aiFetchJson(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  return data.choices?.[0]?.message?.content || '';
}

async function groqTranscribe(audio) {
  const form = new FormData();
  form.append('file', audio, `voice.${(audio.type.split('/')[1] || 'webm').split(';')[0]}`);
  form.append('model', 'whisper-large-v3-turbo');
  const data = await aiFetchJson('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${ai.cfg.key}` }, body: form,
  });
  return data.text || '';
}

function normalizeAiItem(raw) {
  const kind = AI_KINDS[raw.kind] ? raw.kind : 'note';
  const pick = (v, re) => (typeof v === 'string' && re.test(v) ? v : '');
  const venture = db.ventures.find((v) => v.toLowerCase() === String(raw.venture || '').toLowerCase()) || (state.venture !== 'All' ? state.venture : 'General');
  const start = pick(raw.start, /^\d{2}:\d{2}$/);
  return {
    kind,
    title: String(raw.title || raw.body || '').trim().slice(0, 200),
    body: String(raw.body || '').trim(),
    date: pick(raw.date, /^\d{4}-\d{2}-\d{2}$/),
    start,
    end: pick(raw.end, /^\d{2}:\d{2}$/) || (start ? addMinutes(start, 60) : ''),
    venture,
    priority: ['p1', 'p2', 'p3'].includes(raw.priority) ? raw.priority : 'p2',
    url: kind === 'link' ? String(raw.url || '').trim() : '',
  };
}

async function aiOrganize({ text = '', audio = null } = {}) {
  let source = `Note:\n"""${text}"""`;
  if (audio && ai.cfg.provider === 'groq') {
    text = await groqTranscribe(audio);
    source = `Note:\n"""${text}"""`;
    audio = null;
  } else if (audio) {
    source = 'Note: the attached voice recording.';
  }
  const parsed = extractJson(await aiGenerate(aiPrompt(source), audio));
  const items = (Array.isArray(parsed.items) ? parsed.items : []).map(normalizeAiItem).filter((i) => i.title);
  return { items, transcript: parsed.transcript || text };
}

let aiBusy = false;
async function aiCapture(input) {
  if (aiBusy) return;
  aiBusy = true;
  setCaptureBusy(true);
  try {
    const { items, transcript } = await aiOrganize(input);
    if (!items.length) throw new Error('Nothing to capture was found');
    openAiReview(items, transcript);
  } catch (err) {
    if (!input.text) return toast(`AI: ${err.message}`);
    capture(input.text); // fall back to the built-in parser
    toast(`AI unavailable (${err.message}) — saved without AI`);
  } finally {
    aiBusy = false;
    setCaptureBusy(false);
  }
}

function setCaptureBusy(busy) {
  const form = $('[data-form="capture"]');
  if (!form) return;
  form.classList.toggle('busy', busy);
  $('button[type=submit]', form).innerHTML = busy ? '<span class="spinner" aria-hidden="true"></span>' : icon('bolt');
}

let aiReviewItems = [];
function openAiReview(items, transcript) {
  aiReviewItems = items;
  const kindOptions = (k) => Object.keys(AI_KINDS).map((x) => `<option value="${x}" ${x === k ? 'selected' : ''}>${x[0].toUpperCase() + x.slice(1)}</option>`).join('');
  const ventureOptions = (v) => db.ventures.map((x) => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');
  openModal(`${icon('sparkle')} Review ${items.length} item${items.length > 1 ? 's' : ''}`, `
    <form id="ai-review" data-form="ai-review">
      ${transcript ? `<p class="confirm-note">“${esc(transcript)}”</p>` : ''}
      ${items.map((it, i) => `
        <div class="ai-item" data-i="${i}">
          <div class="row">
            <input type="checkbox" class="check" name="on-${i}" checked aria-label="Include item">
            <select name="kind-${i}" class="ai-kind" aria-label="Type">${kindOptions(it.kind)}</select>
            <select name="venture-${i}" class="ai-venture" aria-label="Venture">${ventureOptions(it.venture)}</select>
          </div>
          <input type="text" name="title-${i}" value="${esc(it.title)}" aria-label="Title">
          <div class="field-row ai-when" data-kind="${it.kind}">
            <input type="date" name="date-${i}" value="${it.date}" aria-label="Date" class="${it.kind === 'event' && !it.date ? 'missing' : ''}">
            <input type="time" name="start-${i}" value="${it.start}" aria-label="Start time" class="${it.kind === 'event' && !it.start ? 'missing' : ''}">
          </div>
        </div>`).join('')}
    </form>`,
    `<button class="btn ghost" type="button" data-action="close">Cancel</button><span class="spacer"></span><button class="btn" type="submit" form="ai-review">Add selected</button>`);
}

function saveAiReview(form) {
  const fd = new FormData(form);
  const chosen = aiReviewItems.map((it, i) => fd.get(`on-${i}`) && {
    ...it,
    kind: fd.get(`kind-${i}`), venture: fd.get(`venture-${i}`), title: String(fd.get(`title-${i}`)).trim(),
    date: fd.get(`date-${i}`), start: fd.get(`start-${i}`),
  }).filter((it) => it && it.title);
  const missing = chosen.find((it) => it.kind === 'event' && !it.date);
  if (missing) return toast(`Add a date for “${missing.title}”`);
  for (const it of chosen) {
    const base = { id: uid(), venture: it.venture, createdAt: Date.now() };
    const end = it.start ? (it.end && it.end > it.start ? it.end : addMinutes(it.start, 60)) : '';
    if (it.kind === 'link') {
      const url = it.url || (it.title.match(URL_RE) || [])[0];
      if (url) addResource(url, it.url ? it.title : '', { venture: it.venture, notes: it.body });
      else upsert('notes', { ...base, title: it.title, body: it.body, pinned: false, updatedAt: Date.now() });
      continue;
    }
    const item = {
      idea: { ...base, title: it.title, body: it.body, stage: 'spark', impact: 3, effort: 3 },
      task: { ...base, title: it.title, due: it.date, priority: it.priority, done: false, notes: it.body },
      event: { ...base, title: it.title, date: it.date, start: it.start, end, type: 'meeting', notes: it.body },
      note: { ...base, title: it.title, body: it.body, pinned: false, updatedAt: Date.now() },
      decision: { ...base, title: it.title, date: it.date || today(), context: it.body, rationale: '' },
    }[it.kind];
    upsert(AI_KINDS[it.kind], item);
  }
  closeModal();
  render();
  toast(chosen.length ? `Added ${chosen.length} item${chosen.length > 1 ? 's' : ''}` : 'Nothing selected');
}

/* ---------- Voice capture ---------- */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const voice = { rec: null, recorder: null, chunks: [], active: false };

function setMicState(on) {
  voice.active = on;
  const btn = $('[data-action="voice"]');
  if (btn) { btn.classList.toggle('listening', on); btn.setAttribute('aria-pressed', on); btn.innerHTML = icon(on ? 'stop' : 'mic'); }
  const input = $('[data-form="capture"] input');
  if (input && on) input.placeholder = 'Listening… tap stop when done';
  else if (input) syncCapturePills(input);
}

function finishVoiceText(text) {
  const clean = text.trim();
  if (!clean) return toast('Didn’t catch that — try again');
  const input = $('[data-form="capture"] input');
  if (input) input.value = clean;
  if (ai.ready) aiCapture({ text: clean });
  else if (capture(clean) !== 'confirm' && input) input.value = '';
}

function startSpeechRecognition() {
  const rec = new SpeechRec();
  rec.lang = navigator.language || 'en-US';
  rec.interimResults = true;
  rec.continuous = true;
  let finalText = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    const input = $('[data-form="capture"] input');
    if (input) input.value = (finalText + interim).trim();
  };
  rec.onerror = (e) => { if (e.error !== 'aborted' && e.error !== 'no-speech') toast(`Voice: ${e.error}`); };
  rec.onend = () => {
    const wasActive = voice.active;
    setMicState(false);
    voice.rec = null;
    if (wasActive || finalText) finishVoiceText(finalText || ($('[data-form="capture"] input')?.value || ''));
  };
  voice.rec = rec;
  rec.start();
  setMicState(true);
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  voice.chunks = [];
  recorder.ondataavailable = (e) => e.data.size && voice.chunks.push(e.data);
  recorder.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    setMicState(false);
    const blob = new Blob(voice.chunks, { type: recorder.mimeType || 'audio/webm' });
    if (blob.size) aiCapture({ audio: blob });
  };
  voice.recorder = recorder;
  recorder.start();
  setMicState(true);
}

async function toggleVoice() {
  if (voice.active) {
    voice.active = false;
    if (voice.rec) voice.rec.stop();
    if (voice.recorder && voice.recorder.state !== 'inactive') voice.recorder.stop();
    return;
  }
  try {
    if (SpeechRec) return startSpeechRecognition();
    if (ai.ready && ai.provider.audio && window.MediaRecorder && navigator.mediaDevices?.getUserMedia) return await startRecording();
    toast(ai.ready ? 'Voice isn’t supported in this browser — try Chrome or Safari' : 'Voice needs Chrome/Safari, or add a free AI key in Settings');
  } catch (err) {
    setMicState(false);
    toast(err.name === 'NotAllowedError' ? 'Microphone permission was blocked' : `Voice: ${err.message}`);
  }
}

function aiCard() {
  const p = ai.provider;
  return `<p class="small muted">Speak or type naturally — AI splits it into tasks, events, ideas and notes with dates and times. Uses a free-tier model with your own key, stored only on this device.</p>
    <form data-form="ai-config">
      <div class="field-row">
        <div class="field"><label for="ai-provider">Provider</label>
          <select id="ai-provider" name="provider">${Object.entries(AI_PROVIDERS).map(([k, v]) => `<option value="${k}" ${k === ai.cfg.provider ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <div class="field"><label for="ai-model">Model</label>
          <input type="text" id="ai-model" name="model" value="${esc(ai.cfg.model)}" placeholder="${esc(p.model)}" autocomplete="off"></div>
      </div>
      <div class="field"><label for="ai-key">API key · <a href="${p.keyUrl}" target="_blank" rel="noopener noreferrer">get a free key</a></label>
        <input type="password" id="ai-key" name="key" value="${esc(ai.cfg.key)}" placeholder="Paste your key" autocomplete="off"></div>
      <label class="row small" style="margin-bottom:12px"><input type="checkbox" class="check" name="auto" ${ai.cfg.auto ? 'checked' : ''}> Organize typed notes with AI too</label>
      <div class="row">
        <button class="btn" type="submit">Save</button>
        <button class="btn ghost" type="button" data-action="ai-test" ${ai.ready ? '' : 'disabled'}>Test</button>
        ${ai.ready ? '<span class="badge ok">Connected</span>' : ''}
      </div>
    </form>`;
}

/* ---------- Share target (installed PWA on Android) ---------- */
function handleShare() {
  const params = new URLSearchParams(location.search);
  const shared = [params.get('url'), params.get('text'), params.get('title')].filter(Boolean).join(' ');
  const url = shared.match(URL_RE);
  if (!url) return;
  const title = (params.get('title') || '').trim();
  addResource(url[0], URL_RE.test(title) ? '' : title);
  state.view = 'resources';
  history.replaceState(null, '', location.pathname + '#resources');
  setTimeout(() => toast('Saved to Resources'), 300);
}

/* ---------- Boot ---------- */
initTheme();
hydrateIcons();
const initial = location.hash.slice(1);
if (VIEWS.some((v) => v.id === initial)) state.view = initial;
handleShare();
render();
try { if (!localStorage.getItem(STORE_KEY)) saveLocal(); } catch {}
cloud.init();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && cloud.user) cloud.pull(); });
window.addEventListener('online', () => { if (cloud.user) cloud.pull(); });
setInterval(() => { if (document.visibilityState === 'visible' && cloud.user && !cloud.cfg.dirty) cloud.pull(); }, 60000);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
