import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { now } from '../lib/util.js';

function StepRow({ n, t, d, on }) {
  return (
    <div className="row card" style={{ padding: '13px 16px', outline: on ? '2px solid var(--leaf)' : undefined }}>
      <div className="num" style={on ? { background: 'var(--moss)', color: 'var(--on-moss)' } : undefined}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{t}</div>
        <div className="small muted">{d}</div>
      </div>
      <div className="small muted">60초</div>
    </div>
  );
}

export default function Onboard() {
  const { S, update, startFlow, go } = useApp();
  const [name, setName] = useState(S.name);
  const saveName = () => update((n) => { n.name = name.trim().slice(0, 12); });

  return (
    <section className="scr" style={{ paddingTop: 36 }}>
      <div className="between">
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>Oru</div>
        <div className="row" style={{ gap: 6 }} aria-hidden="true">
          <i style={{ width: 22, height: 6, borderRadius: 3, background: 'var(--moss)' }} />
          <i style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--line2)' }} />
          <i style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--line2)' }} />
        </div>
      </div>
      <div className="eyebrow" style={{ marginTop: 20 }}>FIRST RITUAL · 3분</div>
      <h1 className="h1">{'숨, 얼굴, 마음.\n나를 위한 첫 리추얼'}</h1>
      <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>함께 숨 쉬고, 얼굴을 어루만지고,<br />오늘의 나에게 다정한 말을 건네요.</p>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: 10 }} aria-hidden="true">
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'var(--leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 132, height: 132, borderRadius: '50%', background: 'var(--leaf-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--leaf)', color: '#14332A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>숨</div>
          </div>
        </div>
      </div>
      <StepRow n={1} t="함께하는 명상 · 호흡" d="싱잉볼과 4–6 호흡" on />
      <StepRow n={2} t="Facial Massage" d="오늘 요일의 2동작" />
      <StepRow n={3} t="내 마음 어루만지기" d="오늘의 격언과 한 줄 기록" />
      <div className="card">
        <label htmlFor="obName" style={{ fontSize: 13, fontWeight: 700 }}>어떻게 불러드릴까요? <span className="muted" style={{ fontWeight: 400 }}>(선택)</span></label>
        <input id="obName" className="field" style={{ marginTop: 8 }} maxLength={12} placeholder="이름 또는 별명" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <button className="btn" onClick={() => { saveName(); startFlow(now().getDay(), 'full'); }}>첫 리추얼 시작하기</button>
      <button className="btn line" onClick={() => { saveName(); update((n) => { n.onboarded = true; }); go('today'); }}>먼저 둘러볼게요</button>
    </section>
  );
}
