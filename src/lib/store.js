/* Local persistence: everything stays in this browser (localStorage). */
const KEY = 'oru-ritual-app-v1';

export function defState() {
  return {
    name: '',
    onboarded: false,
    days: {},
    myRoutine: null,
    settings: { sound: true, vib: true, vol: 70, am: '07:30', mo: '12:00-15:00', fast: false },
  };
}

export function load() {
  const d = defState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw) || {};
      return { ...d, ...o, settings: { ...d.settings, ...(o.settings || {}) }, days: o.days || {} };
    }
  } catch (e) { /* storage unavailable */ }
  return d;
}

export function persist(S) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}

/** Ensure a day record exists on a draft state and return it. */
export function rec(S, k) {
  if (!S.days[k]) S.days[k] = { b: false, m: false, h: false, note: '' };
  return S.days[k];
}
