import { useApp } from '../AppContext.js';
import { MOVES } from '../data/content.js';
import { todayKey, emo, emoQuote, DAYS_KO, THEMES } from '../lib/util.js';
import { RitualHeader, Quote } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

export default function Match() {
  const { S, update, flow, setFlow, nextStep, setOverlay, toast } = useApp();
  const r = S.days[todayKey()] || {}, ci = r.ci || {}, E = emo(ci.e), th = THEMES[flow.dayIdx], Q = emoQuote(ci.e);
  const picked = flow.picked || {};
  const custom = flow.rec && flow.rec.join() !== flow.moves.join();
  const my = S.myRoutine;
  const myDiff = my && my.length === flow.moves.length && my.join() !== flow.moves.join();

  const resetRec = () => { setFlow({ ...flow, moves: flow.rec.slice(), picked: {} }); toast('추천 루틴으로 되돌렸어요'); };
  const loadMy = () => {
    const p = {};
    my.forEach((m) => { if (!flow.rec.includes(m)) p[m] = true; });
    setFlow({ ...flow, moves: my.slice(), picked: p });
    toast('내 루틴을 불러왔어요');
  };
  const saveMy = () => { update((n) => { n.myRoutine = flow.moves.slice(); }); toast('내 루틴으로 저장했어요. 다음 체크인 때 바로 불러올 수 있어요'); };

  return (
    <section className="scr">
      <RitualHeader />
      <div>
        <div className="eyebrow">나에게 맞춘 오늘의 리추얼</div>
        <h1 className="h2" style={{ marginTop: 6, fontSize: 22 }}>{`${E ? E.adj : '오늘의'} 나를 위해\n오늘의 Ritual을\n다음과 같이 준비했어요`}</h1>
      </div>
      <div className="hero">
        <div className="eyebrow">{E ? `지금 ${E.n}인 나에게 건네는 한마디` : '나의 마음에 건네는 오늘의 한마디'}</div>
        <Quote q={Q} size={15} />
      </div>
      <div className="card">
        <div className="between">
          <div style={{ fontSize: 15, fontWeight: 700 }}><Icon n="breath" s={16} /> 호흡 · 1분</div>
          <div className="small muted">4–6 호흡</div>
        </div>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.6 }}>{E ? E.br : '내쉬는 숨에 긴장을 내려놓아요'}</div>
      </div>
      <div className="card">
        <div className="between">
          <div style={{ fontSize: 15, fontWeight: 700 }}>페이셜 테라피 · {flow.moves.length}동작</div>
          <div className="small muted">{custom ? '내 루틴' : '추천 루틴'} · {th.slot}</div>
        </div>
        {flow.moves.map((m, i) => {
          const w = flow.why[m];
          return (
            <div key={m} className="row" style={{ padding: '10px 0', borderTop: i ? '1px solid var(--line)' : undefined }}>
              <div className="num">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{MOVES[m].n}</div>
                <div className="small muted" style={{ marginTop: 2, lineHeight: 1.5 }}>
                  {picked[m] ? <span style={{ color: 'var(--moss)', fontWeight: 700 }}>내가 고른 동작</span>
                    : w ? <>{w}에 힘이 들어가 있어 먼저 풀어요 · <span style={{ color: 'var(--moss)', fontWeight: 700 }}>내 긴장 맞춤</span></>
                      : `${DAYS_KO[flow.dayIdx]}요일 테라피`}
                </div>
              </div>
              <button className="swapb" onClick={() => setOverlay({ type: 'swap', i })} aria-label={`${i + 1}번 ${MOVES[m].n} 바꾸기`}>바꾸기</button>
            </div>
          );
        })}
        <div className="between" style={{ marginTop: 4, borderTop: '1px solid var(--line)' }}>
          {custom ? <button className="linkb" onClick={resetRec}>추천대로 되돌리기</button>
            : myDiff ? <button className="linkb" onClick={loadMy}>내 루틴 불러오기</button>
              : <span className="small muted">바꾸고 싶은 동작을 눌러 보세요</span>}
          <button className="linkb" onClick={saveMy}><Icon n="star" s={14} /> 내 루틴으로 저장</button>
        </div>
      </div>
      <button className="btn" style={{ marginTop: 'auto' }} onClick={nextStep}>{custom ? '내 루틴으로 시작하기 · 5분' : '이대로 시작하기 · 5분'}</button>
    </section>
  );
}
