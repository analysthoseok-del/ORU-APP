import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { rec } from '../lib/store.js';
import { MOVES } from '../data/content.js';
import { now, addDays, todayKey, fmtDate, amLabel, quoteFor, streak, isDone, DAYS_KO, THEMES } from '../lib/util.js';
import { Quote, EPill } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

export default function Today() {
  const { S, update, startFlow, continueToday, setOverlay, openWith, toast } = useApp();
  const [line, setLine] = useState('');
  const d = now(), k = todayKey(), di = d.getDay(), th = THEMES[di], tm = THEMES[(di + 1) % 7];
  const Q = quoteFor(d), TQ = quoteFor(addDays(d, 1)), r = S.days[k] || {}, st = streak(S);
  const steps = [
    ['b', 'breath', 'breath', '함께하는 명상 · 호흡', '싱잉볼과 4–6 호흡 · 60초'],
    ['m', 'massage', 'face', th.tn, `${th.moves.map((m) => MOVES[m].short).join(' · ')} · 3분`],
    ['h', 'mind', 'heart', '내 마음 어루만지기', '격언과 한 줄 기록 · 60초'],
  ];
  const nextIdx = steps.findIndex((s) => !r[s[0]]);
  const allDone = isDone(S, k);

  const saveLine = () => {
    const v = line.trim();
    if (!v) { toast('한 줄을 적은 뒤 저장해 주세요'); return; }
    const willDone = r.b && r.m;
    update((n) => { const x = rec(n, todayKey()); x.note = v; x.h = true; });
    setLine('');
    toast(willDone ? '기록했어요 · 오늘의 리추얼 완료' : '오늘의 한 줄을 기록했어요');
  };
  const copyQuote = () => {
    const q = `${Q.en} ${Q.ko.join(' ')}`;
    try { navigator.clipboard.writeText(q).then(() => toast('오늘의 한마디를 복사했어요'), () => toast(q)); } catch (e) { toast(q); }
  };

  return (
    <section className="scr">
      <div className="between">
        <div>
          <div className="small muted">{fmtDate(d)}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>안녕하세요{S.name ? `, ${S.name}님` : ''}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="pill soft">연속 {st}일째</span>
          <button className="icb" onClick={() => setOverlay({ type: 'lock', moment: true })} aria-label="Oru Moment 알림 미리보기"><Icon n="bell" /></button>
        </div>
      </div>
      <div className="row" style={{ alignItems: 'baseline', gap: 8 }}>
        <div className="sec">Healing Spirit</div><div className="small muted">오늘의 나와 내일의 나에게</div>
      </div>
      <div className="hero">
        <div className="between"><div className="eyebrow">나의 마음에 건네는 오늘의 한마디</div><span style={{ color: '#E7C169' }}><Icon n="star" s={16} /></span></div>
        <Quote q={Q} />
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button className="ghost" onClick={() => setOverlay({ type: 'lock', moment: false })}>잠금화면에 두기</button>
          <button className="ghost" onClick={copyQuote}>한마디 복사</button>
        </div>
      </div>
      <div className="between" style={{ marginTop: 2 }}><div className="sec">오늘의 리추얼</div><div className="small muted">5분</div></div>
      {r.ci && r.co ? (
        <button className="card row" style={{ border: 0, width: '100%', textAlign: 'left', color: 'var(--ink)', padding: '12px 14px' }} onClick={() => openWith('report', 'today')}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="small muted">오늘의 변화</div>
            <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <EPill k={r.ci.e} /><span className="muted">→</span><EPill k={r.co.e} />
              <span className="small" style={{ fontWeight: 700, color: 'var(--moss)' }}>마음의 무게 {r.ci.w} → {r.co.w}</span>
            </div>
          </div>
          <Icon n="right" s={18} />
        </button>
      ) : <div className="small muted" style={{ marginTop: -6 }}>시작할 때 10초 마음 체크인, 마칠 때 전후 비교가 함께해요</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) => (
          <button key={s[0]} className={`step${i === nextIdx ? ' next' : ''}`} onClick={() => startFlow(di, s[1])}>
            <div className="ico"><Icon n={s[2]} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div className="t">{s[3]}</div><div className="d">{s[4]}</div></div>
            {r[s[0]] ? <div className="done-dot" aria-label="완료"><Icon n="check" s={14} /></div>
              : i === nextIdx ? <div className="small" style={{ fontWeight: 700, color: 'var(--moss)' }}>다음</div> : null}
          </button>
        ))}
      </div>
      {allDone
        ? <button className="btn sub" onClick={() => startFlow(di, 'full')}>오늘의 리추얼 완료 · 한 번 더 하기</button>
        : <button className="btn" onClick={continueToday}>{nextIdx > 0 ? '이어서 하기' : '5분 리추얼 시작하기'}</button>}
      <div className="card" style={{ border: '1px dashed var(--leaf)' }}>
        <label htmlFor="oneline" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--moss)' }}>한 줄 기록 · {th.ask}</label>
        {r.note ? (
          <>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>{r.note}</div>
            <button className="btn line" style={{ height: 32, width: 'auto', padding: 0, marginTop: 4 }} onClick={() => startFlow(di, 'mind')}>고쳐 쓰기</button>
          </>
        ) : (
          <div className="row" style={{ marginTop: 8, gap: 8 }}>
            <input id="oneline" className="field" maxLength={80} placeholder="한 줄로 적어보세요" value={line}
              onChange={(e) => setLine(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveLine(); } }} />
            <button className="icb" style={{ background: 'var(--btn)', color: 'var(--btn-fg)' }} onClick={saveLine} aria-label="한 줄 기록 저장"><Icon n="check" /></button>
          </div>
        )}
      </div>
      <div className="gold">
        <div className="between">
          <div className="eyebrow">내일의 나를 위한 한마디 · {DAYS_KO[(di + 1) % 7]} · {tm.t}</div>
          <div className="small" style={{ color: 'var(--gold-ink)' }}>내일 {amLabel(S.settings.am)}</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, fontStyle: 'italic', lineHeight: 1.5 }}>{TQ.en}</div>
        <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{TQ.ko[0]}</div>
      </div>
    </section>
  );
}
