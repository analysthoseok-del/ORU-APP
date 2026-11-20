import { useEffect, useRef } from 'react';
import { MOMENTS, MOVES } from '../data/content.js';
import { now, pad, fmtDate, amLabel, quoteFor, todayKey, area, safeOrder, ro } from '../lib/util.js';
import { useApp } from '../AppContext.js';
import Icon from './Icon.jsx';

function LockPreview({ moment }) {
  const { S, setOverlay, startFlow } = useApp();
  const d = now(), Q = quoteFor(d);
  const mo = useRef(MOMENTS[Math.floor(Math.random() * MOMENTS.length)]).current;
  return (
    <div className="lock" role="dialog" aria-label="잠금화면 미리보기"
      onClick={(e) => { if (!e.target.closest('.noti') && !e.target.closest('button')) setOverlay(null); }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: 'var(--night-sub)' }}>{fmtDate(d)}</div>
        <div className="clock">{pad(d.getHours())}:{pad(d.getMinutes())}</div>
      </div>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {moment && (
          <div className="noti">
            <div className="row" style={{ gap: 8 }}>
              <div className="app-i">Oru</div><div style={{ fontSize: 12, fontWeight: 700 }}>Oru Moment</div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: '#4E5F57' }}>지금</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{mo}</div>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <button className="btn2" onClick={() => { setOverlay(null); startFlow(now().getDay(), 'breath'); }}>30초 호흡하기</button>
              <button className="btn3" onClick={() => setOverlay(null)}>나중에</button>
            </div>
          </div>
        )}
        <div className="noti">
          <div className="row" style={{ gap: 8 }}>
            <div className="app-i">Oru</div><div style={{ fontSize: 12, fontWeight: 700 }}>나의 마음에 건네는 오늘의 한마디</div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#4E5F57' }}>{amLabel(S.settings.am)}</div>
          </div>
          <div style={{ marginTop: 10, fontStyle: 'italic', fontSize: 13, color: '#3F6B4A' }}>{Q.en}</div>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>{Q.ko.map((l, i) => <div key={i}>{l}</div>)}</div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#3F6B4A' }}>5분 리추얼 시작하기</div>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <div className="small" style={{ color: 'var(--night-sub)' }}>실제 앱에서는 휴대폰 잠금화면에 이렇게 표시돼요</div>
        <button className="ghost" style={{ color: 'var(--night-fg)' }} onClick={() => setOverlay(null)}>미리보기 닫기</button>
      </div>
    </div>
  );
}

function SwapSheet({ i }) {
  const { S, flow, setFlow, setOverlay, toast } = useApp();
  const firstRef = useRef(null);
  useEffect(() => { if (firstRef.current) firstRef.current.focus(); }, []);
  if (!flow) return null;
  const cur = flow.moves[i];
  const ci = (S.days[todayKey()] || {}).ci || {};
  const recFor = {};
  (ci.a || []).forEach((k) => { const A = area(k); if (A) recFor[A.m] = A.n; });
  let focusSet = false;

  const pick = (m) => {
    const old = flow.moves[i];
    const moves = flow.moves.slice();
    moves[i] = m;
    const picked = { ...(flow.picked || {}), [m]: true };
    delete picked[old];
    setFlow({ ...flow, moves: safeOrder(moves), picked });
    setOverlay(null);
    toast(`${MOVES[old].n} 대신 ${ro(MOVES[m].n)} 바꿨어요`);
  };

  return (
    <>
      <div className="sheet-bg" onClick={() => setOverlay(null)} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${i + 1}번 동작 바꾸기`}>
        <div className="grab" />
        <div className="between">
          <div>
            <div className="eyebrow">나만의 루틴 만들기</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{i + 1}번 {MOVES[cur].n} 대신</div>
          </div>
          <button className="icb" onClick={() => setOverlay(null)} aria-label="닫기"><Icon n="x" /></button>
        </div>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
          10가지 동작 중 하나를 골라 주세요. 순서는 근육 풀기 → 림프 길 열기 → 끌어올리기로 자동 정리돼요.
        </div>
        {MOVES.map((M, m) => {
          const inR = flow.moves.includes(m), isCur = m === cur;
          let r;
          if (!inR && !focusSet) { r = firstRef; focusSet = true; }
          return (
            <button key={m} ref={r} className="mvopt" disabled={inR} onClick={() => pick(m)}>
              <div className="num">{m + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">{M.n}</div>
                <div className="d">{M.title.replace(/\n/g, ' ')}</div>
              </div>
              {isCur ? <span className="pill soft">지금 동작</span>
                : inR ? <span className="small muted">루틴에 있음</span>
                  : recFor[m] ? <span className="pill soft">{recFor[m]} 추천</span> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function Overlay() {
  const { overlay } = useApp();
  if (!overlay) return null;
  return (
    <div className="overlay">
      {overlay.type === 'lock' && <LockPreview moment={overlay.moment} />}
      {overlay.type === 'swap' && <SwapSheet i={overlay.i} />}
    </div>
  );
}
