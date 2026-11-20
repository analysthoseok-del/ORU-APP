import { DAYS_KO, THEMES, POOLS, EMOS, AREAS, KIND, KEYWORDS } from '../data/content.js';

/* ---------- dates ---------- */
export const pad = (n) => String(n).padStart(2, '0');
export const now = () => new Date();
export const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const todayKey = () => keyOf(now());
export const fromKey = (k) => { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
export const fmtDate = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS_KO[d.getDay()]}요일`;
export const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
export const amLabel = (t) => { const h = +t.split(':')[0], m = t.split(':')[1]; return `${h < 12 ? '오전 ' : '오후 '}${(h % 12) || 12}:${m}`; };

/* ---------- quotes: weekday pools rotate weekly from Mon 2026-11-02 ---------- */
const ANCHOR = new Date(2026, 10, 2);
export function quoteFor(d) {
  const p = POOLS[d.getDay()];
  const w = Math.floor(Math.round((sod(d) - ANCHOR) / 864e5) / 7);
  return p[((w % p.length) + p.length) % p.length];
}
export const qDay = (di) => quoteFor(addDays(now(), (di - now().getDay() + 7) % 7));

/* ---------- emotions & tension areas ---------- */
export const emo = (k) => EMOS.find((E) => E.k === k) || null;
export const area = (k) => AREAS.find((A) => A.k === k) || null;
export const areaNames = (a) => (a || []).map((k) => area(k).n).join(' · ');
export function emoQuote(k, d) {
  const E = emo(k);
  d = d || now();
  if (!E) return quoteFor(d);
  const n = Math.round((sod(d) - ANCHOR) / 864e5);
  const r = E.q[((n % E.q.length) + E.q.length) % E.q.length];
  return POOLS[r[0]][r[1]];
}

/* tension areas lead today's therapy; order follows 근육 풀기 → 림프 → 끌어올리기 */
const rank = (m) => (m === 8 ? 0 : m === 0 ? 1 : 2);
export const safeOrder = (a) =>
  a.map((m, i) => [m, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map((x) => x[0]);
export function personalMoves(base, areas) {
  const out = [], why = {};
  (areas || []).slice(0, 2).forEach((k) => {
    const A = area(k);
    if (A && !out.includes(A.m)) { out.push(A.m); why[A.m] = A.n; }
  });
  base.forEach((m) => { if (out.length < 3 && !out.includes(m)) out.push(m); });
  return { moves: safeOrder(out), why };
}

/* ---------- records ---------- */
export const isDone = (S, k) => { const d = S.days[k]; return !!(d && d.b && d.m && d.h); };
export const isAny = (S, k) => { const d = S.days[k]; return !!(d && (d.b || d.m || d.h || d.note)); };
export function streak(S) {
  let d = now();
  if (!isDone(S, keyOf(d))) d = addDays(d, -1);
  let n = 0;
  while (isDone(S, keyOf(d))) { n++; d = addDays(d, -1); }
  return n;
}
export function weekData(S) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now(), -i), k = keyOf(d), r = S.days[k] || {};
    out.push({ d, k, ci: r.ci, co: r.co, today: i === 0 });
  }
  return out;
}
export function growthData(S) {
  const out = [];
  for (let i = 34; i >= 0; i--) {
    const d = addDays(now(), -i), k = keyOf(d), r = S.days[k];
    if (r && (r.note || r.ci)) out.push({ d, k, ago: i, r, wk: 4 - Math.floor(i / 7) });
  }
  return out;
}
export const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export const kindOf = (t) => KIND.some((w) => t.includes(w));
export function topWords(arr) {
  const c = {};
  arr.forEach((t) => KEYWORDS.forEach((p) => { if (t.includes(p[0])) c[p[1]] = (c[p[1]] || 0) + 1; }));
  return Object.keys(c).map((w) => [w, c[w]]).sort((a, b) => b[1] - a[1]).slice(0, 4);
}

/* Korean particle 으로/로 for the last syllable */
export function ro(word) {
  const c = word.charCodeAt(word.length - 1) - 44032;
  const jb = c >= 0 && c < 11172 ? c % 28 : 0;
  return word + (jb && jb !== 8 ? '으로' : '로');
}

export { DAYS_KO, THEMES };
