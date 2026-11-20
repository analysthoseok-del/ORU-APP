import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { rec } from '../lib/store.js';
import { todayKey } from '../lib/util.js';
import { RitualHeader, EmoGrid, AreaChips, WeightCard } from '../components/bits.jsx';

export default function CheckOut() {
  const { S, update, nextStep, toast } = useApp();
  const ci = (S.days[todayKey()] || {}).ci || {};
  const [e, setE] = useState(null);
  const [w, setW] = useState(ci.w || 5);
  const [a, setA] = useState((ci.a || []).slice());

  const go = () => {
    if (!e) { toast('지금 마음과 가장 가까운 단어를 하나 골라 주세요'); return; }
    update((n) => { rec(n, todayKey()).co = { e, w, a: a.slice() }; });
    nextStep();
  };

  return (
    <section className="scr">
      <RitualHeader />
      <div>
        <div className="eyebrow">리추얼을 마친 지금</div>
        <h1 className="h1" style={{ marginTop: 6 }}>{'마음은\n어떻게 달라졌나요?'}</h1>
      </div>
      <EmoGrid value={e} onChange={setE} />
      <WeightCard id="wOut2" label="지금 마음의 무게" value={w} onChange={setW} />
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700 }}>아직 힘이 남은 곳이 있나요?</div>
        <div className="small muted" style={{ margin: '4px 0 10px' }}>처음에 고른 곳이 표시되어 있어요. 풀린 곳은 눌러서 빼 주세요</div>
        <AreaChips value={a} onChange={setA} noneLabel="모두 풀렸어요" />
      </div>
      <button className="btn" style={{ marginTop: 'auto' }} onClick={go}>전후 비교 보기</button>
    </section>
  );
}
