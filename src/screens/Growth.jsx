import { useApp } from '../AppContext.js';
import { now, growthData, avg, kindOf, topWords, DAYS_KO, THEMES } from '../lib/util.js';
import { EPill, WeekBars, Legend } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

function Box({ x, isNow }) {
  const r = x.r, ci = r.ci;
  const when = isNow ? `${x.ago === 0 ? '오늘' : `${x.ago}일 전`} · 지금` : `${x.ago}일 전 · 처음`;
  return (
    <div className={`box${isNow ? ' now' : ''}`}>
      <div className="lbl"><span>{when} · {x.d.getMonth() + 1}월 {x.d.getDate()}일</span>{ci && <span><EPill k={ci.e} /></span>}</div>
      <div className="txt">{r.note}</div>
      {ci && <div className="small muted" style={{ marginTop: 6 }}>리추얼 전 마음의 무게 {ci.w}{r.co ? ` → 후 ${r.co.w}` : ''}</div>}
    </div>
  );
}

function Words({ list, isNow }) {
  const t = topWords(list.map((x) => x.r.note));
  if (!t.length) return <div className="small muted" style={{ marginTop: 8 }}>아직 반복된 단어가 없어요</div>;
  return <div className={`kw${isNow ? ' now' : ''}`}>{t.map((p) => <span key={p[0]}>{p[0]}<b>{p[1]}</b></span>)}</div>;
}

export default function Growth() {
  const { S, back, go } = useApp();
  const G = growthData(S), notes = G.filter((x) => x.r.note);

  const head = (
    <>
      <div className="between">
        <button className="icb" onClick={() => go(back.growth)} aria-label="뒤로"><Icon n="left" /></button>
        <div className="small muted">최근 5주</div>
        <div style={{ width: 44 }} />
      </div>
      <div>
        <div className="eyebrow">MY GROWTH</div>
        <h1 className="h1" style={{ marginTop: 6, fontSize: 26 }}>나의 변화 기록</h1>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.6 }}>한 줄 기록과 마음 체크인이 쌓이면, 처음의 나와 지금의 나를 나란히 볼 수 있어요.</div>
      </div>
    </>
  );

  if (notes.length < 4) {
    return (
      <section className="scr">
        {head}
        <div className="card" style={{ lineHeight: 1.7 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>기록이 조금 더 필요해요</div>
          <div className="small muted" style={{ marginTop: 6 }}>한 줄 기록이 4개 이상 쌓이면 변화를 보여 드려요. 지금 {notes.length}개예요.</div>
        </div>
        <p className="demo-note">시연하려면 나 탭 → 시연 도구 → 지난 5주 기록 채우기를 눌러 주세요.</p>
      </section>
    );
  }

  const halfN = Math.floor(notes.length / 2) || 1;
  const early = notes.slice(0, halfN), late = notes.slice(notes.length - halfN);
  const A = notes[0], B = notes[notes.length - 1];
  const W = [0, 1, 2, 3, 4].map((w) => {
    const xs = G.filter((x) => x.wk === w && x.r.ci);
    return {
      b: avg(xs.map((x) => x.r.ci.w)),
      a: avg(xs.filter((x) => x.r.co).map((x) => x.r.co.w)),
      t: avg(xs.map((x) => (x.r.ci.a || []).length)),
      n: xs.length,
    };
  });
  const wl = ['5주 전', '4주 전', '3주 전', '2주 전', '이번 주'];
  const cols = W.map((w, i) => ({ ok: !!w.n, b: w.b, a: w.a, name: wl[i], strong: i === 4, label: `${wl[i]} 평균 전 ${w.b.toFixed(1)}, 후 ${w.a.toFixed(1)}` }));
  const Wn = W.filter((w) => w.n), w0 = Wn[0] || { b: 0, t: 0 }, w1 = Wn[Wn.length - 1] || { b: 0, t: 0 };
  const kE = Math.round((early.filter((x) => kindOf(x.r.note)).length / early.length) * 100);
  const kL = Math.round((late.filter((x) => kindOf(x.r.note)).length / late.length) * 100);
  const dW = w0.b - w1.b, dT = w0.t - w1.t;
  const mets = [
    ['정신 · 리추얼 전', '마음의 무게', `${w0.b.toFixed(1)} → ${w1.b.toFixed(1)}`, dW > 0 ? `${dW.toFixed(1)}칸 가벼워짐` : '비슷해요'],
    ['얼굴 · 주 평균', '긴장 부위', `${w0.t.toFixed(1)} → ${w1.t.toFixed(1)}곳`, dT > 0 && w0.t ? `긴장 ${Math.round((dT / w0.t) * 100)}% 줄어듦` : '비슷해요'],
    ['마음 · 나에게', '다정한 말', `${kE}% → ${kL}%`, kL > kE ? '다정한 한 줄이 늘었어요' : '꾸준해요'],
  ];
  const td = now().getDay();
  const same = notes.filter((x) => x.d.getDay() === td).reverse().slice(0, 5);

  return (
    <section className="scr">
      {head}
      <div className="hero">
        <div className="eyebrow">한 줄 기록 {notes.length}개 · 체크인 {G.filter((x) => x.r.ci).length}회</div>
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.45, marginTop: 8, whiteSpace: 'pre-line' }}>
          {dW > 0 ? `5주 전보다\n마음이 ${dW.toFixed(1)}칸 가벼워졌어요` : '5주 동안 꾸준히\n나를 돌봤어요'}
        </div>
        <div className="small" style={{ marginTop: 8, color: 'var(--hero-sub)' }}>리추얼 전 마음의 무게 · 첫 주 평균과 이번 주 평균 비교</div>
      </div>
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 900 }}>그때와 지금</div>
        <div className="small muted" style={{ marginTop: 2 }}>처음 남긴 한 줄과 가장 최근의 한 줄</div>
        <div className="tn"><Box x={A} /><Box x={B} isNow /></div>
      </div>
      <div className="sec" style={{ fontSize: 16 }}>나의 개선 지표</div>
      <div className="mets">
        {mets.map((m) => (
          <div className="met" key={m[1]}>
            <div className="k">{m[0]}<br />{m[1]}</div>
            <div className="v">{m[2]}</div>
            <div className="d">{m[3]}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="between"><div style={{ fontSize: 15, fontWeight: 900 }}>주별 마음의 무게</div><Legend /></div>
        <WeekBars cols={cols} n={5} />
      </div>
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 900 }}>자주 쓴 단어의 변화</div>
        <div className="small muted" style={{ marginTop: 8 }}>처음 {early.length}개의 한 줄</div>
        <Words list={early} />
        <div className="small muted" style={{ marginTop: 12 }}>최근 {late.length}개의 한 줄</div>
        <Words list={late} isNow />
      </div>
      {same.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 900 }}>같은 질문, 달라진 나의 답</div>
          <div className="small muted" style={{ marginTop: 2 }}>{DAYS_KO[td]}요일 · {THEMES[td].ask}</div>
          <div style={{ marginTop: 6 }}>
            {same.map((x, i) => (
              <div className="erow" key={x.k} style={{ gridTemplateColumns: '62px 1fr', alignItems: 'start' }}>
                <div className="small" style={{ fontWeight: 700, color: i ? 'var(--muted)' : 'var(--moss)' }}>{x.ago === 0 ? '오늘' : `${x.d.getMonth() + 1}.${x.d.getDate()}`}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>{x.r.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="demo-note">감정·마음의 무게·표정 긴장·한 줄 기록은 스스로 남긴 셀프케어 기록이에요. 의료적 진단이 아니에요.</p>
    </section>
  );
}
