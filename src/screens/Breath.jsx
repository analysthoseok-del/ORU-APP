import { useEffect, useRef, useState } from 'react';
import { useApp } from '../AppContext.js';
import { todayKey, emo, mmss } from '../lib/util.js';
import { chime, buzz } from '../lib/sound.js';
import { useRunner } from '../lib/useRunner.js';
import { RitualHeader } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

export default function Breath() {
  const { S, flow, nextStep } = useApp();
  const [runKey, setRunKey] = useState(0);
  const orb = useRef(null), ph = useRef(null), ct = useRef(null), hint = useRef(null), bar = useRef(null), el = useRef(null);
  const last = useRef('');
  const alive = useRef(true);
  const E = flow && flow.mode === 'full' && emo(((S.days[todayKey()] || {}).ci || {}).e);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { chime(S.settings, 1); last.current = ''; }, [runKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const { paused, toggle } = useRunner({
    dur: 60, key: runKey, fast: S.settings.fast,
    onTick: (t) => {
      const c = t % 10, inh = c < 4, p = inh ? c / 4 : (c - 4) / 6;
      const sc = inh ? 0.55 + 0.45 * ease(p) : 1 - 0.45 * ease(p);
      if (orb.current) orb.current.style.transform = `scale(${sc.toFixed(3)})`;
      const key = inh ? 'in' : 'out';
      if (key !== last.current) {
        last.current = key;
        if (ph.current) ph.current.textContent = inh ? '들이쉬기' : '내쉬기';
        if (hint.current) hint.current.textContent = inh ? '코로 천천히 들이쉬어요' : '입으로 길게 내쉬며 긴장을 내려놓아요';
        buzz(S.settings, 25);
      }
      if (ct.current) ct.current.textContent = Math.max(1, Math.ceil(inh ? 4 - c : 10 - c));
      if (bar.current) bar.current.style.width = `${(t / 60) * 100}%`;
      if (el.current) el.current.textContent = mmss(t);
    },
    onDone: () => {
      chime(S.settings, 1.2); buzz(S.settings, 80);
      if (orb.current) orb.current.style.transform = 'scale(1)';
      if (ph.current) ph.current.textContent = '잘 하셨어요';
      if (ct.current) ct.current.textContent = '';
      if (hint.current) hint.current.textContent = '다음은 페이셜 테라피예요';
      setTimeout(() => { if (alive.current) nextStep(); }, 1300);
    },
  });

  return (
    <section className="scr night">
      <RitualHeader night />
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <div className="eyebrow" style={{ color: 'var(--leaf)' }}>이완 호흡 · 4–6</div>
        <h1 className="h2" style={{ marginTop: 6, fontSize: 24 }}>내쉬는 숨에 내려놓기</h1>
        {E && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--night-sub)' }}>지금의 {E.n}에게 · {E.br}</div>}
      </div>
      <div className="orb-wrap">
        <div className="ring a" /><div className="ring b" />
        <div className="orb" ref={orb}><div className="ph" ref={ph}>준비</div><div className="cnt" ref={ct}>·</div></div>
      </div>
      <p ref={hint} style={{ textAlign: 'center', fontSize: 15, lineHeight: 1.7, color: 'var(--night-sub)' }}>어깨의 힘을 빼고 편하게 앉아요</p>
      <div>
        <div className="bar"><i ref={bar} /></div>
        <div className="times"><span ref={el}>0:00</span><span>1:00</span></div>
      </div>
      <div className="ctl">
        <button className="side" onClick={() => setRunKey((k) => k + 1)} aria-label="처음부터"><Icon n="back" s={24} /></button>
        <button className="main" onClick={toggle} aria-label={paused ? '다시 시작' : '일시정지'}><Icon n={paused ? 'play' : 'pause'} s={26} /></button>
        <button className="side" onClick={() => nextStep()} aria-label="다음 단계로"><Icon n="next" s={24} /></button>
      </div>
    </section>
  );
}
