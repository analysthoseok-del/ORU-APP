import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { now, keyOf, todayKey, fromKey, isDone, isAny, streak, weekData, avg, DAYS_KO, THEMES } from '../lib/util.js';
import Icon from '../components/Icon.jsx';

export default function Journal() {
  const { S, openWith } = useApp();
  const t0 = now();
  const [cal, setCal] = useState({ y: t0.getFullYear(), m: t0.getMonth() });
  const moveMonth = (dir) => setCal(({ y, m }) => {
    m += dir;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    return { y, m };
  });

  const first = new Date(cal.y, cal.m, 1), off = (first.getDay() + 6) % 7, dim = new Date(cal.y, cal.m + 1, 0).getDate(), tk = todayKey();
  let monthDone = 0;
  const cells = [];
  for (let i = 0; i < off; i++) cells.push(<div key={`o${i}`} />);
  for (let dd = 1; dd <= dim; dd++) {
    const dt = new Date(cal.y, cal.m, dd), k = keyOf(dt);
    let cls = 'd';
    if (dt > t0 && k !== tk) cls += ' future';
    else if (isDone(S, k)) { cls += ' full'; monthDone++; }
    else if (isAny(S, k)) cls += ' part';
    if (k === tk) cls += ' today';
    cells.push(<div key={k} className={cls}>{dd}</div>);
  }
  const allNotes = Object.keys(S.days).filter((k) => S.days[k].note).sort().reverse();
  const notes = allNotes.slice(0, 5);
  const massage = Object.keys(S.days).filter((k) => S.days[k].m).length;
  const has = weekData(S).filter((x) => x.ci && x.co);
  const bw = avg(has.map((x) => x.ci.w)), aw = avg(has.map((x) => x.co.w));

  return (
    <section className="scr">
      <div className="between">
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>기록</h1>
        <div className="row" style={{ gap: 4 }}>
          <button className="icb" onClick={() => moveMonth(-1)} aria-label="이전 달"><Icon n="left" s={18} /></button>
          <div style={{ fontSize: 14, fontWeight: 700, minWidth: 84, textAlign: 'center' }}>{cal.y}년 {cal.m + 1}월</div>
          <button className="icb" onClick={() => moveMonth(1)} aria-label="다음 달"><Icon n="right" s={18} /></button>
        </div>
      </div>
      {has.length ? (
        <button className="hero row" style={{ border: 0, width: '100%', textAlign: 'left' }} onClick={() => openWith('report', 'journal')}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">이번 주 마음·얼굴 리포트</div>
            <div style={{ fontSize: 17, fontWeight: 900, marginTop: 6 }}>마음의 무게 {bw.toFixed(1)} → {aw.toFixed(1)}</div>
            <div className="small" style={{ color: 'var(--hero-sub)', marginTop: 4 }}>리추얼 {has.length}회 · 평균 {Math.round(((bw - aw) / bw) * 100)}% 가벼워졌어요</div>
          </div>
          <Icon n="right" s={20} />
        </button>
      ) : (
        <button className="card row" style={{ border: 0, width: '100%', textAlign: 'left', color: 'var(--ink)' }} onClick={() => openWith('report', 'journal')}>
          <div className="num" style={{ width: 40, height: 40, borderRadius: 12 }}><Icon n="chart" s={18} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>이번 주 마음·얼굴 리포트</div>
            <div className="small muted" style={{ marginTop: 2 }}>체크인을 하면 전후 변화가 쌓여요</div>
          </div>
          <Icon n="right" s={18} />
        </button>
      )}
      <div className="card" style={{ padding: '14px 12px 16px' }}>
        <div className="cal">{['월', '화', '수', '목', '금', '토', '일'].map((w) => <div key={w} className="h">{w}</div>)}{cells}</div>
        <div className="legend"><span><i style={{ background: 'var(--leaf)' }} />리추얼 완료</span><span><i style={{ background: 'var(--leaf-mid)' }} />일부만 함</span></div>
      </div>
      <div className="stats">
        <div className="card"><div className="small muted">연속</div><div className="v">{streak(S)}일</div></div>
        <div className="card"><div className="small muted">이번 달 완료</div><div className="v">{monthDone}회</div></div>
        <div className="card"><div className="small muted">테라피 누적</div><div className="v">{massage * 3}분</div></div>
      </div>
      <button className="card row" style={{ border: 0, width: '100%', textAlign: 'left', color: 'var(--ink)', outline: '2px solid var(--leaf)' }} onClick={() => openWith('growth', 'journal')}>
        <div className="num" style={{ width: 40, height: 40, borderRadius: 12 }}><Icon n="star" s={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>나의 변화 기록</div>
          <div className="small muted" style={{ marginTop: 2 }}>그때와 지금 · 개선 지표 · 달라진 나의 답</div>
        </div>
        <Icon n="right" s={18} />
      </button>
      <div className="between">
        <div className="sec" style={{ fontSize: 16 }}>한 줄 기록</div>
        {allNotes.length > 5 && (
          <button className="small" style={{ border: 0, background: 'none', color: 'var(--moss)', fontWeight: 700, minHeight: 44 }} onClick={() => openWith('growth', 'journal')}>
            전체 {allNotes.length}개 · 변화 보기
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notes.length ? notes.map((k) => {
          const d = fromKey(k);
          return (
            <div className="card" key={k} style={{ padding: '12px 14px' }}>
              <div className="small" style={{ fontWeight: 700, color: 'var(--moss)' }}>{d.getMonth() + 1}월 {d.getDate()}일 {DAYS_KO[d.getDay()]} · {THEMES[d.getDay()].p}</div>
              <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.55 }}>{S.days[k].note}</div>
            </div>
          );
        }) : <div className="card small muted" style={{ lineHeight: 1.6 }}>아직 남긴 한 줄이 없어요. 오늘 탭이나 리추얼 마지막 단계에서 첫 기록을 남겨 보세요.</div>}
      </div>
    </section>
  );
}
