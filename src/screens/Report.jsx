import { useApp } from '../AppContext.js';
import { AREAS, MOVES } from '../data/content.js';
import { now, weekData, avg, DAYS_KO, THEMES } from '../lib/util.js';
import { EPill, WeekBars, Legend } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

export default function Report() {
  const { S, back, go, openWith, startFlow, continueToday } = useApp();
  const W = weekData(S), has = W.filter((x) => x.ci && x.co);
  const goBack = () => go(back.report === 'done' ? 'today' : back.report);

  const head = (
    <>
      <div className="between">
        <button className="icb" onClick={goBack} aria-label="뒤로"><Icon n="left" /></button>
        <div className="small muted">{W[0].d.getMonth() + 1}.{W[0].d.getDate()} – {W[6].d.getMonth() + 1}.{W[6].d.getDate()}</div>
        <div style={{ width: 44 }} />
      </div>
      <div>
        <div className="eyebrow">WEEKLY REPORT</div>
        <h1 className="h1" style={{ marginTop: 6, fontSize: 26 }}>{'이번 주\n마음·얼굴 리포트'}</h1>
      </div>
    </>
  );

  if (!has.length) {
    return (
      <section className="scr">
        {head}
        <div className="card" style={{ lineHeight: 1.7 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>아직 이번 주 기록이 없어요</div>
          <div className="small muted" style={{ marginTop: 6 }}>5분 리추얼을 할 때 마음 체크인과 리추얼 후 체크를 하면, 감정·마음의 무게·표정 긴장의 변화가 여기에 쌓여요.</div>
        </div>
        <button className="btn" onClick={continueToday}>5분 리추얼 시작하기</button>
        <p className="demo-note">시연하려면 나 탭 → 시연 도구 → 지난 5주 기록 채우기를 눌러 주세요.</p>
      </section>
    );
  }

  const bw = avg(has.map((x) => x.ci.w)), aw = avg(has.map((x) => x.co.w)), pct = Math.round(((bw - aw) / bw) * 100);
  const cols = W.map((x) => {
    const ok = !!(x.ci && x.co);
    return { ok, b: ok && x.ci.w, a: ok && x.co.w, name: x.today ? '오늘' : DAYS_KO[x.d.getDay()], strong: x.today,
      label: `${DAYS_KO[x.d.getDay()]}요일 ${ok ? `전 ${x.ci.w}, 후 ${x.co.w}` : '기록 없음'}` };
  });
  const cnt = {};
  let left = 0;
  has.forEach((x) => { (x.ci.a || []).forEach((k) => { cnt[k] = (cnt[k] || 0) + 1; }); left += (x.co.a || []).length; });
  const tot = Object.values(cnt).reduce((a, b) => a + b, 0);
  const top = AREAS.slice().sort((p, q) => (cnt[q.k] || 0) - (cnt[p.k] || 0));
  const mx = cnt[top[0].k] || 1;
  const best = has.slice().sort((p, q) => (q.ci.w - q.co.w) - (p.ci.w - p.co.w))[0];
  const bd = best.ci.w - best.co.w, bth = THEMES[best.d.getDay()];
  const TA = cnt[top[0].k] ? top[0] : null;

  return (
    <section className="scr">
      {head}
      <div className="hero">
        <div className="eyebrow">이번 주 리추얼 {has.length}회</div>
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.45, marginTop: 8, whiteSpace: 'pre-line' }}>
          {pct > 0 ? `리추얼 뒤 마음이\n평균 ${pct}% 가벼워졌어요` : '이번 주도 5분씩\n나를 돌봤어요'}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--hero-sub)' }}>마음의 무게 평균 {bw.toFixed(1)} → {aw.toFixed(1)} · 표정 긴장 {tot}곳 → {left}곳</div>
      </div>
      <div className="card">
        <div className="between"><div style={{ fontSize: 15, fontWeight: 900 }}>정신 · 마음의 무게</div><Legend /></div>
        <WeekBars cols={cols} />
      </div>
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 900 }}>마음 · 감정의 흐름</div>
        <div style={{ marginTop: 6 }}>
          {has.slice().reverse().map((x) => (
            <div className="erow" key={x.k}>
              <div className="small" style={{ fontWeight: 700 }}>{x.today ? '오늘' : `${DAYS_KO[x.d.getDay()]}요일`}</div>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}><EPill k={x.ci.e} /><span className="muted">→</span><EPill k={x.co.e} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 900 }}>얼굴 · 힘이 자주 들어간 곳</div>
        <div className="small muted" style={{ marginTop: 2 }}>리추얼 전 체크 기준 · 리추얼 뒤 남은 긴장 {left}곳</div>
        {top.filter((A) => cnt[A.k]).map((A) => (
          <div className="hbar" key={A.k}>
            <span>{A.n}</span>
            <div className="tr"><i style={{ width: `${(cnt[A.k] / mx) * 100}%` }} /></div>
            <span className="small muted" style={{ textAlign: 'right' }}>{cnt[A.k]}회</span>
          </div>
        ))}
      </div>
      {TA && (
        <div className="gold">
          <div className="eyebrow">다음 주 추천</div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, marginTop: 6 }}>{TA.n}에 힘이 가장 자주 들어갔어요. 저녁에 '{MOVES[TA.m].n}' 1분을 더해 보세요.</div>
          <button className="btn" style={{ marginTop: 12, height: 44 }} onClick={() => startFlow(now().getDay(), 'move', [TA.m])}>{MOVES[TA.m].n} 해보기 · 1분</button>
        </div>
      )}
      <div className="card">
        <div className="small muted">가장 가벼워진 날</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{best.today ? '오늘' : `${DAYS_KO[best.d.getDay()]}요일`} · {bth.tn}</div>
        <div className="small" style={{ fontWeight: 700, color: 'var(--moss)', marginTop: 4 }}>마음의 무게 {best.ci.w} → {best.co.w}{bd > 0 ? ` (−${bd})` : ''}</div>
      </div>
      <button className="btn sub" onClick={() => openWith('growth', 'report')}><Icon n="star" s={18} /> 5주 동안의 나의 변화 기록 보기</button>
      <p className="demo-note">감정·마음의 무게·표정 긴장은 스스로 체크한 셀프케어 기록이에요. 의료적 진단이 아니에요.</p>
    </section>
  );
}
