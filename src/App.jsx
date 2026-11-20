import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppCtx } from './AppContext.js';
import { load, persist, rec, defState } from './lib/store.js';
import { now, todayKey, isDone, personalMoves, THEMES } from './lib/util.js';
import { unlockAudio } from './lib/sound.js';
import Icon from './components/Icon.jsx';
import Overlay from './components/Overlay.jsx';
import Onboard from './screens/Onboard.jsx';
import Today from './screens/Today.jsx';
import Library from './screens/Library.jsx';
import Journal from './screens/Journal.jsx';
import Me from './screens/Me.jsx';
import CheckIn from './screens/CheckIn.jsx';
import Match from './screens/Match.jsx';
import Breath from './screens/Breath.jsx';
import Massage from './screens/Massage.jsx';
import Mind from './screens/Mind.jsx';
import CheckOut from './screens/CheckOut.jsx';
import Done from './screens/Done.jsx';
import Report from './screens/Report.jsx';
import Growth from './screens/Growth.jsx';

const TABS = ['today', 'library', 'journal', 'me'];
const TAB_DEF = { today: ['home', '오늘'], library: ['clock', '리추얼'], journal: ['book', '기록'], me: ['user', '나'] };
const SCREENS = {
  onboard: Onboard, today: Today, library: Library, journal: Journal, me: Me,
  checkin: CheckIn, match: Match, breath: Breath, massage: Massage, mind: Mind,
  checkout: CheckOut, done: Done, report: Report, growth: Growth,
};

export default function App() {
  const [S, setS] = useState(load);
  const [route, setRoute] = useState(() => (load().onboarded ? 'today' : 'onboard'));
  const [tab, setTab] = useState('today');
  const [flow, setFlow] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [back, setBack] = useState({ report: 'journal', growth: 'journal' });
  const viewRef = useRef(null);
  const toastTimer = useRef(0);

  // refs so timer callbacks always see the latest state
  const ref = useRef({});
  ref.current = { S, route, tab, flow };

  useEffect(() => { persist(S); }, [S]);

  /** Mutate a copy of the app state. */
  const update = useCallback((fn) => {
    setS((prev) => { const n = structuredClone(prev); fn(n); return n; });
  }, []);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2800);
  }, []);

  const go = useCallback((r) => {
    setRoute(r);
    if (TABS.includes(r)) setTab(r);
    if (viewRef.current) viewRef.current.scrollTop = 0;
  }, []);

  const scrollTop = useCallback(() => { if (viewRef.current) viewRef.current.scrollTop = 0; }, []);

  const startFlow = useCallback((dayIdx, mode, moves) => {
    unlockAudio();
    const steps = mode === 'full' ? ['checkin', 'match', 'breath', 'massage', 'mind', 'checkout'] : [mode === 'move' ? 'massage' : mode];
    const first = mode === 'full' && !ref.current.S.onboarded;
    setFlow({
      dayIdx, steps, i: 0, mode, first,
      moves: moves || (first ? THEMES[dayIdx].moves.slice(0, 2) : THEMES[dayIdx].moves),
      why: {}, rec: null, picked: {}, mk: 0, dur: first ? 30 : 60,
    });
    go(steps[0]);
  }, [go]);

  /** Continue a half-finished ritual today (only the missing steps). */
  const continueToday = useCallback(() => {
    const { S: s } = ref.current;
    const r = s.days[todayKey()] || {}, di = now().getDay();
    if (isDone(s, todayKey()) || !(r.b || r.m || r.h)) { startFlow(di, 'full'); return; }
    unlockAudio();
    const steps = [];
    if (!r.b) steps.push('breath');
    if (!r.m) steps.push('massage');
    if (!r.h) steps.push('mind');
    if (r.ci && !r.co) steps.push('checkout');
    const P = personalMoves(THEMES[di].moves, (r.ci || {}).a);
    setFlow({
      dayIdx: di, steps, i: 0, mode: 'full', first: false,
      moves: r.ci ? P.moves : THEMES[di].moves, why: r.ci ? P.why : {}, rec: null, picked: {}, mk: 0, dur: 60,
    });
    go(steps[0]);
  }, [go, startFlow]);

  /** Advance the ritual. `patch` merges into the flow first (e.g. personalised moves). */
  const nextStep = useCallback((patch) => {
    const { flow: f0, route: r, tab: t, S: s } = ref.current;
    if (!f0) return;
    const f = patch && !patch.nativeEvent ? { ...f0, ...patch } : f0;
    const key = { breath: 'b', massage: 'm', mind: 'h' }[r];
    if (key) update((n) => { rec(n, todayKey())[key] = true; });
    const i = f.i + 1;
    if (i < f.steps.length) {
      setFlow({ ...f, i, mk: 0 });
      go(f.steps[i]);
      return;
    }
    if (f.mode === 'full') {
      if (!s.onboarded) update((n) => { n.onboarded = true; });
      go('done');
      return;
    }
    const msg = { breath: '호흡 리추얼을 마쳤어요', massage: '페이셜 테라피를 마쳤어요', move: '동작 연습을 마쳤어요', mind: '한 줄 기록을 남겼어요' }[f.mode];
    const day = { ...(s.days[todayKey()] || {}) };
    if (key) day[key] = true;
    setFlow(null);
    go(t);
    toast(msg + (day.b && day.m && day.h ? ' · 오늘의 리추얼 완료' : ''));
  }, [go, toast, update]);

  const closeFlow = useCallback(() => {
    setFlow(null);
    go(ref.current.S.onboarded ? ref.current.tab : 'onboard');
  }, [go]);

  const stepLabel = useCallback(() => {
    const { flow: f, route: r } = ref.current;
    if (!f) return '';
    if (f.mode === 'full') {
      const core = ['breath', 'massage', 'mind'].indexOf(r);
      return core >= 0 ? `리추얼 ${core + 1} / 3` : { checkin: '마음 체크인 · 10초', match: '나에게 맞춘 리추얼', checkout: '리추얼 후 체크 · 10초' }[r];
    }
    return { breath: '호흡 명상', massage: '3분 페이셜 테라피', move: '동작 연습', mind: '내 마음 어루만지기' }[f.mode];
  }, []);

  const openWith = useCallback((kind, from) => {
    setBack((b) => ({ ...b, [kind]: from || 'journal' }));
    if (kind === 'report' && from === 'done') setFlow(null);
    go(kind);
  }, [go]);

  const wipeAll = useCallback(() => {
    setS((prev) => ({ ...defState(), name: prev.name }));
    setFlow(null);
    go('onboard');
    toast('모든 기록을 지웠어요');
  }, [go, toast]);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOverlay(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const app = useMemo(() => ({
    S, update, route, tab, flow, setFlow, go, toast, startFlow, continueToday, nextStep, closeFlow,
    stepLabel, overlay, setOverlay, back, openWith, wipeAll, scrollTop,
  }), [S, update, route, tab, flow, go, toast, startFlow, continueToday, nextStep, closeFlow, stepLabel, overlay, back, openWith, wipeAll, scrollTop]);

  const Screen = SCREENS[route] || Today;
  const isTab = TABS.includes(route);
  const needsFlow = !['onboard', 'done', 'report', 'growth', ...TABS].includes(route);

  return (
    <AppCtx.Provider value={app}>
      <div className="app">
        <main className="view" ref={viewRef}>
          {needsFlow && !flow ? <Today /> : <Screen />}
        </main>
        <nav className="tabs" aria-label="주요 메뉴" hidden={!isTab}>
          {TABS.map((t) => (
            <button key={t} onClick={() => go(t)} aria-current={t === tab && isTab ? 'page' : undefined}>
              <Icon n={TAB_DEF[t][0]} s={22} />{TAB_DEF[t][1]}
            </button>
          ))}
        </nav>
        <Overlay />
        <div className="toast" role="status" aria-live="polite" hidden={!toastMsg}>{toastMsg}</div>
      </div>
    </AppCtx.Provider>
  );
}
