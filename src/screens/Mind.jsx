import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { rec } from '../lib/store.js';
import { todayKey, emo, emoQuote, qDay, DAYS_KO, THEMES } from '../lib/util.js';
import { RitualHeader, Quote } from '../components/bits.jsx';

export default function Mind() {
  const { S, update, flow, nextStep } = useApp();
  const th = THEMES[flow.dayIdx], r = S.days[todayKey()] || {};
  const E = flow.mode === 'full' && r.ci && emo(r.ci.e);
  const [note, setNote] = useState(r.note || '');

  const save = () => {
    const v = note.trim();
    if (v) update((n) => { rec(n, todayKey()).note = v; });
    nextStep();
  };

  return (
    <section className="scr">
      <RitualHeader />
      <div className="eyebrow" style={{ marginTop: 6 }}>내 마음 어루만지기 · 60초</div>
      <div className="hero">
        <div className="eyebrow">{E ? `지금 ${E.n}인 나에게 건네는 한마디` : '나의 마음에 건네는 오늘의 한마디'}</div>
        <Quote q={E ? emoQuote(r.ci.e) : qDay(flow.dayIdx)} size={16} />
      </div>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
        한마디를 소리 내어 천천히 두 번 읽어 보세요.<br />마음에 남는 단어 하나를 떠올리고, 아래에 한 줄로 남겨요.
      </p>
      <div className="card">
        <label htmlFor="mindNote" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{th.ask}</label>
        <div className="small muted" style={{ marginTop: 4 }}>{DAYS_KO[flow.dayIdx]}요일 · {th.p}</div>
        <textarea id="mindNote" className="field" rows={3} maxLength={120} style={{ marginTop: 12 }} placeholder="한 줄로 적어보세요"
          value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button className="btn" onClick={save}>기록하고 마치기</button>
        <button className="btn line" onClick={() => nextStep()}>오늘은 마음으로만 간직할게요</button>
      </div>
    </section>
  );
}
