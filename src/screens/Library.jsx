import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { MOVES } from '../data/content.js';
import { now, qDay, DAYS_KO, THEMES } from '../lib/util.js';
import Face from '../components/Face.jsx';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Library() {
  const { startFlow } = useApp();
  const today = now().getDay();
  const [libDay, setLibDay] = useState(today);
  const sel = THEMES[libDay], SQ = qDay(libDay);

  return (
    <section className="scr">
      <h1 style={{ fontSize: 24, fontWeight: 900 }}>리추얼</h1>
      <div className="sec" style={{ fontSize: 16 }}>요일별 리추얼</div>
      <div className="small muted" style={{ marginTop: -8 }}>오늘의 한마디 100개가 요일 테마에 맞춰 날마다 바뀌어요</div>
      <div className="hscroll">
        {ORDER.map((i) => (
          <button key={i} className={`dcard${i === today ? ' today' : ''}${i === libDay ? ' sel' : ''}`} aria-pressed={i === libDay} onClick={() => setLibDay(i)}>
            <span className="w">{DAYS_KO[i]}{i === today ? ' · 오늘' : ''}</span>
            <span className="n">{THEMES[i].t}</span>
            <span className="m">{THEMES[i].slot} 테라피</span>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="eyebrow">{DAYS_KO[libDay]}요일 · {sel.p}</div>
        <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, fontStyle: 'italic', lineHeight: 1.5 }}>{SQ.en}</div>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.65 }}>{SQ.ko.map((l, i) => <div key={i}>{l}</div>)}</div>
        <div className="between" style={{ marginTop: 14 }}>
          <div className="eyebrow">{sel.tn}</div>
          <div className="small muted" style={{ flex: '0 0 auto' }}>3동작 · 각 1분</div>
        </div>
        {sel.moves.map((mi, k) => (
          <div className="row" style={{ marginTop: 8 }} key={`${libDay}-${mi}`}>
            <div className="thumb"><Face mi={mi} uid={`T${k}`} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{MOVES[mi].n}</div>
              <div className="small muted" style={{ marginTop: 4, lineHeight: 1.55 }}>
                {MOVES[mi].steps.map((x, i) => <div key={i}>{i + 1}. {x.replace(/<br>/g, ' ')}</div>)}
              </div>
            </div>
          </div>
        ))}
        <div className="small muted" style={{ marginTop: 12 }}>호흡 1분 · 페이셜 테라피 3분 · 한 줄 기록 1분 · {sel.slot} 추천</div>
        <button className="btn" style={{ marginTop: 12, height: 46 }} onClick={() => startFlow(libDay, 'full')}>이 리추얼 해보기 · 5분</button>
      </div>
      <div className="sec" style={{ fontSize: 16 }}>페이셜 테라피 10동작 · 하나씩 연습</div>
      <div className="list">
        {MOVES.map((m, i) => (
          <button key={i} className="li" onClick={() => startFlow(today, 'move', [i])}>
            <span className="num" style={{ width: 36, height: 36, borderRadius: 12 }}>{i + 1}</span>
            <span className="t">{m.n}</span>
            <span className="small muted">1분</span>
          </button>
        ))}
      </div>
      <div className="sec" style={{ fontSize: 16 }}>호흡</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
        <button className="hero" style={{ border: 0, textAlign: 'left', padding: '12px 14px' }} onClick={() => startFlow(today, 'breath')}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>이완</div>
          <div className="small" style={{ color: 'var(--night-sub)', marginTop: 2 }}>4–6 호흡 · 60초</div>
        </button>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>잠들기 전</div>
          <div className="small muted" style={{ marginTop: 2 }}>4–7–8 호흡 · 준비 중</div>
        </div>
      </div>
    </section>
  );
}
