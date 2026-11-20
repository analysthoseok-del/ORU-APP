import { useApp } from '../AppContext.js';
import { now, todayKey, streak, amLabel, areaNames, DAYS_KO, THEMES } from '../lib/util.js';
import { EPill } from '../components/bits.jsx';
import Icon from '../components/Icon.jsx';

export function CompareCard({ r, withLink }) {
  const { openWith } = useApp();
  if (!r || !r.ci || !r.co) return null;
  const b = r.ci, a = r.co, d = b.w - a.w, ba = (b.a || []).length, aa = (a.a || []).length;
  const line = d > 0 ? `오늘 5분으로 마음이 ${d}칸 가벼워졌어요`
    : d === 0 ? '마음의 무게는 그대로예요. 그래도 나를 돌본 5분이었어요' : '마음이 조금 무거워졌어요. 그런 날도 괜찮아요';
  const Bar = ({ w, c }) => <div className="wbar"><i style={{ width: `${w * 10}%`, background: c }} /></div>;
  return (
    <div className="card">
      <div className="between">
        <div style={{ fontSize: 15, fontWeight: 900 }}>리추얼 전후 비교</div>
        {d > 0 && <span className="delta">−{d}</span>}
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>{line}</div>
      <div className="cmp">
        <div><div className="k">마음 · 감정</div><div className="vv"><EPill k={b.e} /><span className="arrow">→</span><EPill k={a.e} /></div></div>
        <div>
          <div className="between"><div className="k">정신 · 마음의 무게</div><div className="small" style={{ fontWeight: 700 }}>{b.w} → {a.w}</div></div>
          <Bar w={b.w} c="var(--line2)" /><Bar w={a.w} c="var(--moss)" />
        </div>
        <div>
          <div className="between"><div className="k">얼굴 · 표정 긴장</div><div className="small" style={{ fontWeight: 700 }}>{ba}곳 → {aa}곳</div></div>
          <div className="small muted" style={{ marginTop: 4 }}>{ba ? areaNames(b.a) : '긴장 없음'} → {aa ? areaNames(a.a) : '모두 풀렸어요'}</div>
        </div>
      </div>
      {withLink && (
        <button className="btn sub" style={{ marginTop: 12, height: 44, background: 'var(--leaf-soft)', color: 'var(--moss)' }} onClick={() => openWith('report', 'done')}>
          <Icon n="chart" s={18} /> 이번 주 마음·얼굴 리포트
        </button>
      )}
    </div>
  );
}

export default function Done() {
  const { S, setFlow, go, toast } = useApp();
  const st = streak(S), di = now().getDay(), tm = THEMES[(di + 1) % 7], r = S.days[todayKey()] || {};
  const head = st <= 1 ? '첫 리추얼을\n마쳤어요' : `${st}일 연속,\n스스로를 돌봤어요`;
  return (
    <section className="scr" style={{ paddingTop: 44 }}>
      <div className="big-check"><Icon n="check" s={36} /></div>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow">오늘의 리추얼 완료 · 5분</div>
        <h1 className="h1" style={{ fontSize: 26, marginTop: 6 }}>{head}</h1>
      </div>
      <CompareCard r={r} withLink />
      {r.note && (
        <div className="card">
          <div className="small" style={{ fontWeight: 700, color: 'var(--moss)' }}>오늘의 한 줄</div>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>{r.note}</div>
        </div>
      )}
      {st >= 7 ? (
        <div className="badge-earned">
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--night-2)', color: '#E7C169', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="medal" s={22} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>7일 리추얼 배지를 받았어요</div>
            <div className="small" style={{ color: 'var(--night-sub)', marginTop: 2 }}>21일 Healing 챌린지에 초대합니다</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="between"><div style={{ fontSize: 14, fontWeight: 700 }}>7일 리추얼 배지까지 {7 - st}일</div><div className="small muted">{st} / 7</div></div>
          <div className="bar light" style={{ marginTop: 10 }}><i style={{ width: `${(st / 7) * 100}%` }} /></div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
        <div className="card">
          <div className="small muted">내일 · {DAYS_KO[(di + 1) % 7]}요일</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{tm.t}</div>
          <div className="small" style={{ fontWeight: 700, color: 'var(--moss)', marginTop: 10 }}>{amLabel(S.settings.am)} 알림</div>
        </div>
        <button className="gold" style={{ border: 0, textAlign: 'left' }} onClick={() => toast('실제 앱에서는 Oru 스토어의 버블세럼 재구매 페이지로 연결돼요')}>
          <div className="small" style={{ color: 'var(--gold-ink)' }}>나의 리추얼 제품</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Oru 버블세럼</div>
          <div className="small" style={{ fontWeight: 700, color: 'var(--gold-ink)', marginTop: 10 }}>다시 만나기</div>
        </button>
      </div>
      <button className="btn" style={{ marginTop: 'auto' }} onClick={() => { setFlow(null); go('today'); }}>홈으로</button>
    </section>
  );
}
