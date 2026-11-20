import { useEffect, useRef, useState } from 'react';
import { useApp } from '../AppContext.js';
import { MOVES, SAFETY } from '../data/content.js';
import { mmss, THEMES } from '../lib/util.js';
import { chime, buzz } from '../lib/sound.js';
import { useRunner } from '../lib/useRunner.js';
import Face from '../components/Face.jsx';
import Icon from '../components/Icon.jsx';

const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export default function Massage() {
  const { S, flow, setFlow, nextStep, closeFlow, go, stepLabel, toast, scrollTop } = useApp();
  const mv = flow.moves, k = flow.mk, n = mv.length, M = MOVES[mv[k]], last = k === n - 1;
  const D = flow.dur || 60, R = D / 10;
  const anim = { path: useRef(null), fL: useRef(null), fR: useRef(null), ripL: useRef(null), ripR: useRef(null) };
  const [sub, setSub] = useState(-2);
  const [rep, setRep] = useState(1);
  const [left, setLeft] = useState(n * D - k * D);
  const subRef = useRef(-2), repRef = useRef(1), leftRef = useRef(0);
  const th = THEMES[flow.dayIdx];

  useEffect(() => {
    if (k === 0) chime(S.settings, 0.8);
    subRef.current = -2; setSub(-2); repRef.current = 1; setRep(1);
    scrollTop();
  }, [k, mv.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const place = (pt, op) => {
    [anim.fL.current, anim.fR.current].forEach((f) => {
      if (!f) return;
      f.setAttribute('cx', pt.x.toFixed(1)); f.setAttribute('cy', pt.y.toFixed(1)); f.setAttribute('opacity', op);
    });
  };

  const { paused, toggle } = useRunner({
    dur: D, key: `${k}-${mv.join()}`, fast: S.settings.fast,
    onTick: (t) => {
      const path = anim.path.current;
      if (!path) return;
      const len = path.getTotalLength();
      const r = Math.min(R - 1, Math.floor(t / 10)), c = t - r * 10;
      let s;
      if (c < 0.8) { s = 0; place(path.getPointAtLength(0), 1); }
      else if (c < 4.8) { s = 1; place(path.getPointAtLength(len * ease((c - 0.8) / 4)), 1); }
      else if (c < 7.8) { s = 2; place(path.getPointAtLength(len), 1); }
      else { s = -1; place(path.getPointAtLength(len), Math.max(0, 1 - (c - 7.8) / 0.6).toFixed(2)); }
      if (r + 1 !== repRef.current) { repRef.current = r + 1; setRep(r + 1); }
      const lft = Math.round(n * D - (k * D + t));
      if (lft !== leftRef.current) { leftRef.current = lft; setLeft(lft); }
      if (s !== subRef.current) {
        subRef.current = s; setSub(s);
        [anim.ripL.current, anim.ripR.current].forEach((g) => g && g.classList.toggle('on', s === 2));
        if (s === 2) buzz(S.settings, 40);
      }
    },
    onDone: () => {
      if (k + 1 < n) { chime(S.settings, 0.6); setFlow((f) => ({ ...f, mk: k + 1 })); }
      else { chime(S.settings, 1.2); buzz(S.settings, 80); nextStep(); }
    },
  });

  const segs = Array.from({ length: n }, (_, i) => <i key={i} className={i < k ? 'on' : i === k ? 'cur' : ''} />);
  const cap = flow.mode === 'move' ? '동작 연습 · 1분' : `${th.tn} · ${n}동작`;

  return (
    <section className="scr">
      <div className="between">
        <button className="icb" onClick={closeFlow} aria-label="닫기"><Icon n="x" /></button>
        <div className="small muted">{stepLabel()}</div>
        <div className="timechip">{mmss(left)}</div>
      </div>
      <div>
        <div className="segs" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }}>{segs}</div>
        <div className="between small muted" style={{ marginTop: 8 }}>
          <span>{cap}</span>
          {flow.mode !== 'move' && (
            <button className="btn line" style={{ height: 'auto', width: 'auto', padding: 0, fontWeight: 700, color: 'var(--moss)' }}
              onClick={() => { closeFlow(); go('library'); }}>전체 10동작 보기</button>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="between">
          <span className="pill">{R}회 반복 · {rep} / {R}</span>
          <span className="pill dark">양손 동시에 · 좌우 대칭</span>
        </div>
        <div className="stage"><Face key={`${k}-${mv[k]}`} mi={mv[k]} anim={anim} /></div>
        <div className="chips">
          {M.steps.map((s, i) => (
            <div key={i} className={`chip${i === sub ? ' on' : ''}`}><b>{i + 1}</b> {s.split('<br>').map((x, j) => <span key={j}>{j > 0 && <br />}{x}</span>)}</div>
          ))}
        </div>
      </div>
      <div>
        <div className="eyebrow">동작 {k + 1} / {n} · {M.n}{flow.why && flow.why[mv[k]] ? ` · ${flow.why[mv[k]]} 긴장 맞춤` : ''}</div>
        <h2 className="h2" style={{ marginTop: 6 }}>{M.title}</h2>
        <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>{M.desc}</p>
      </div>
      <div className="row card" style={{ padding: '12px 14px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--gold-soft)', color: 'var(--gold-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="drop" s={18} /></div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>시작 전 <b>Oru 버블세럼</b> 2펌프를 손바닥에 펴 발라주세요</div>
      </div>
      <div className="card small" style={{ lineHeight: 1.6 }}>
        <b style={{ color: 'var(--moss)' }}>{th.slot} 팁</b> {th.tip}<br /><span className="muted">{SAFETY}</span>
      </div>
      <div className="between">
        <label htmlFor="mirror" className="small muted">거울 모드 · 영상은 저장되지 않아요</label>
        <input id="mirror" type="checkbox" className="sw"
          onChange={(e) => { if (e.target.checked) toast('실제 앱에서는 전면 카메라로 내 얼굴을 보며 따라 해요. 영상은 저장되지 않아요'); }} />
      </div>
      <div className="ctlrow">
        <button className="btn sub" disabled={k === 0} style={k === 0 ? { opacity: 0.45 } : undefined}
          onClick={() => setFlow((f) => ({ ...f, mk: Math.max(0, f.mk - 1) }))}>이전</button>
        <button className="icb" style={{ background: 'var(--surface)' }} onClick={toggle} aria-label={paused ? '다시 시작' : '일시정지'}><Icon n={paused ? 'play' : 'pause'} s={22} /></button>
        <button className="btn" onClick={() => { if (k + 1 < n) setFlow((f) => ({ ...f, mk: k + 1 })); else nextStep(); }}>
          {last ? (flow.mode === 'full' ? '내 마음 어루만지기로' : '마치기') : '다음 동작'}
        </button>
      </div>
    </section>
  );
}
