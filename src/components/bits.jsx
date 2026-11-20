import { useState } from 'react';
import { EMOS, AREAS } from '../data/content.js';
import { emo } from '../lib/util.js';
import { unlockAudio, chime } from '../lib/sound.js';
import { useApp } from '../AppContext.js';
import Icon from './Icon.jsx';

export function Quote({ q, size }) {
  return (
    <>
      <div className="q-en">{q.en}</div>
      <div className="q-ko" style={size ? { fontSize: size } : undefined}>
        {q.ko.map((l, i) => <span key={i}>{l}{i < q.ko.length - 1 && <br />}</span>)}
      </div>
    </>
  );
}

export function EPill({ k }) {
  const E = emo(k);
  if (!E) return null;
  return <span className="epill"><i className="edot" style={{ background: E.c }} />{E.n}</span>;
}

export function RitualHeader({ night }) {
  const { S, update, stepLabel, closeFlow } = useApp();
  const on = S.settings.sound;
  return (
    <div className="between">
      <button className="icb" onClick={closeFlow} aria-label="닫기"><Icon n="x" /></button>
      <div className="small" style={{ color: night ? 'var(--night-sub)' : 'var(--muted)' }}>{stepLabel()}</div>
      <button className="icb" aria-label={on ? '싱잉볼 소리 끄기' : '싱잉볼 소리 켜기'}
        onClick={() => {
          update((n) => { n.settings.sound = !on; });
          if (!on) { unlockAudio(); chime({ ...S.settings, sound: true }, 0.6); }
        }}>
        <Icon n={on ? 'sound' : 'mute'} />
      </button>
    </div>
  );
}

export function EmoGrid({ value, onChange }) {
  return (
    <div className="emos" role="group" aria-label="지금의 감정">
      {EMOS.map((E) => (
        <button key={E.k} className="emo" aria-pressed={value === E.k} onClick={() => onChange(E.k)}>
          <i style={{ background: E.c }} />{E.n}
        </button>
      ))}
    </div>
  );
}

/** Tension-area chips; `max` limits how many can be picked. */
export function AreaChips({ value, onChange, noneLabel, max, onLimit }) {
  const [touched, setTouched] = useState(false);
  const pick = (k) => {
    setTouched(true);
    if (k === 'none') { onChange([]); return; }
    if (value.includes(k)) { onChange(value.filter((x) => x !== k)); return; }
    if (max && value.length >= max) { onLimit && onLimit(); return; }
    onChange([...value, k]);
  };
  return (
    <div className="areas" role="group">
      {AREAS.map((A) => (
        <button key={A.k} className="area" aria-pressed={value.includes(A.k)} onClick={() => pick(A.k)}>{A.n}</button>
      ))}
      <button className="area" aria-pressed={!value.length && touched} onClick={() => pick('none')}>{noneLabel}</button>
    </div>
  );
}

export function WeightCard({ id, label, value, onChange }) {
  return (
    <div className="card">
      <div className="between">
        <label htmlFor={id} style={{ fontSize: 15, fontWeight: 700 }}>{label}</label>
        <div className="wval">{value}</div>
      </div>
      <input id={id} type="range" min="1" max="10" value={value} style={{ marginTop: 8 }}
        aria-describedby={`${id}Sc`} onChange={(e) => onChange(+e.target.value)} />
      <div className="wscale" id={`${id}Sc`}><span>1 가벼워요</span><span>10 무거워요</span></div>
    </div>
  );
}

/** Bars for mind weight before (light) and after (moss). */
export function WeekBars({ cols, n = 7 }) {
  return (
    <div className="wk" style={n !== 7 ? { gridTemplateColumns: `repeat(${n},minmax(0,1fr))` } : undefined}>
      {cols.map((c, i) => (
        <div className="col" key={i}>
          <div className="bars" aria-label={c.label}>
            {c.ok ? (
              <>
                <i className="b" style={{ height: c.b * 10 }} />
                <i className="a" style={{ height: c.a * 10 }} />
              </>
            ) : <i className="b" style={{ height: 4, opacity: 0.5 }} />}
          </div>
          <div className={`lb${c.strong ? ' t' : ''}`}>{c.name}</div>
        </div>
      ))}
    </div>
  );
}

export function Legend() {
  return (
    <div className="row small muted" style={{ gap: 10 }}>
      <span><i className="edot" style={{ width: 10, height: 10, background: 'var(--line2)' }} /> 전</span>
      <span><i className="edot" style={{ width: 10, height: 10, background: 'var(--moss)' }} /> 후</span>
    </div>
  );
}
