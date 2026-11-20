import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { rec } from '../lib/store.js';
import { todayKey, personalMoves, THEMES } from '../lib/util.js';
import { RitualHeader, EmoGrid, AreaChips, WeightCard } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

export default function CheckIn() {
  const { update, flow, nextStep, toast } = useApp();
  const [e, setE] = useState(null);
  const [w, setW] = useState(5);
  const [a, setA] = useState([]);

  const go = () => {
    if (!e) { toast('지금 마음과 가장 가까운 단어를 하나 골라 주세요'); return; }
    update((n) => { const x = rec(n, todayKey()); x.ci = { e, w, a: a.slice() }; delete x.co; });
    const P = personalMoves(THEMES[flow.dayIdx].moves, a);
    const moves = flow.first ? P.moves.slice(0, 2) : P.moves;
    nextStep({ moves, why: P.why, rec: moves.slice(), picked: {} });
  };

  return (
    <section className="scr">
      <RitualHeader />
      <div>
        <div className="eyebrow">마음 · 얼굴 · 정신 체크인</div>
        <h1 className="h1" style={{ marginTop: 6 }}>{'지금 마음은\n어떤가요?'}</h1>
      </div>
      <EmoGrid value={e} onChange={setE} />
      <WeightCard id="wIn" label="마음의 무게" value={w} onChange={setW} />
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700 }}>얼굴 어디에 힘이 들어가 있나요?</div>
        <div className="small muted" style={{ margin: '4px 0 10px' }}>고른 곳부터 오늘 테라피를 시작해요 · 2곳까지</div>
        <AreaChips value={a} onChange={setA} noneLabel="잘 모르겠어요" max={2} onLimit={() => toast('오늘은 2곳까지 골라 주세요')} />
      </div>
      <button className="scanb" onClick={() => toast('실제 앱에서는 전면 카메라로 미간·턱·눈가의 긴장을 읽어 자동으로 골라 줘요. 영상은 저장되지 않아요')}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--leaf-soft)', color: 'var(--moss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="face" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>표정 스캔으로 긴장 찾기 <span className="small muted" style={{ fontWeight: 400 }}>· 베타</span></div>
          <div className="small muted" style={{ marginTop: 2 }}>전면 카메라로 미간·턱·눈가 긴장을 읽어요</div>
        </div>
      </button>
      <button className="btn" style={{ marginTop: 'auto' }} onClick={go}>나에게 맞춘 리추얼 받기</button>
    </section>
  );
}
