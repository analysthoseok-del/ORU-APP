import { useEffect, useRef, useState } from 'react';
import { useApp } from '../AppContext.js';
import { NOTES_BY_DAY, SEED_WEEKS, SKIP_DAYS } from '../data/content.js';
import { now, addDays, keyOf, streak, amLabel } from '../lib/util.js';
import { unlockAudio, chime, buzz } from '../lib/sound.js';
import Icon from '../components/Icon.jsx';

const AM = ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00'];
const MO = [['10:00-13:00', '오전 10시 ~ 오후 1시'], ['12:00-15:00', '오후 12시 ~ 3시'], ['15:00-18:00', '오후 3시 ~ 6시']];

/** Demo data: 5 weeks of check-ins and one-line notes, gently improving. */
function seedDays(n) {
  for (let i = 1; i <= 34; i++) {
    const d = addDays(now(), -i), k = keyOf(d);
    if (SKIP_DAYS.includes(i)) { delete n.days[k]; continue; }
    const w = 4 - Math.floor(i / 7), SW = SEED_WEEKS[w], j = i % SW[0].length, off = ((i * 7) % 3) - 1;
    n.days[k] = {
      b: true, m: true, h: true,
      note: NOTES_BY_DAY[d.getDay()][w],
      ci: { e: SW[0][j], w: Math.max(1, Math.min(10, SW[1] + off)), a: SW[4][i % 3].slice() },
      co: { e: SW[2][i % SW[2].length], w: Math.max(1, Math.min(10, SW[3] + (off > 0 ? 1 : 0))), a: SW[5][i % 3].slice() },
    };
  }
  n.onboarded = true;
}

function Ghost({ children, onClick, soft, danger }) {
  const style = danger ? { background: '#B4472E', color: '#FFFFFF', border: 0 }
    : soft ? { background: 'var(--leaf-soft)', color: 'var(--moss)', border: 0 }
      : { background: 'var(--btn)', color: 'var(--btn-fg)', border: 0 };
  return <button className="ghost" style={style} onClick={onClick}>{children}</button>;
}

export default function Me() {
  const { S, update, go, toast, setOverlay, wipeAll } = useApp();
  const s = S.settings;
  const [name, setName] = useState(S.name);
  const [armed, setArmed] = useState(false);
  const armTimer = useRef(0);
  useEffect(() => () => clearTimeout(armTimer.current), []);

  const st = streak(S);
  const massageN = Object.keys(S.days).filter((k) => S.days[k].m).length;
  const nNotes = Object.keys(S.days).filter((k) => S.days[k].note).length;
  const badges = [[st >= 7, '7', '7일 연속'], [massageN > 0, '', '첫 마사지'], [nNotes >= 5, '', '기록 5회'], [st >= 21, '21', '21일 연속']];
  const set = (k, v) => update((n) => { n.settings[k] = v; });

  const wipe = () => {
    if (!armed) {
      setArmed(true);
      armTimer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    setArmed(false);
    wipeAll();
  };

  return (
    <section className="scr">
      <div className="row" style={{ gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--leaf)', color: '#14332A', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(S.name || 'O').slice(0, 1)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label htmlFor="nameIn" className="small muted">이름</label>
          <input id="nameIn" className="field" style={{ marginTop: 4, padding: '8px 10px' }} maxLength={12} placeholder="이름 또는 별명" value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { if (name.trim() !== S.name) { update((n) => { n.name = name.trim().slice(0, 12); }); toast('이름을 저장했어요'); } }} />
        </div>
      </div>
      <div className="gold">
        <div className="between">
          <div className="eyebrow">나의 리추얼 제품</div>
          <button className="btn line" style={{ height: 'auto', width: 'auto', padding: 0, color: 'var(--gold-ink)', fontWeight: 700 }}
            onClick={() => toast('실제 앱에서는 카메라로 버블세럼 상자의 QR을 읽어 제품을 연결해요')}>QR 등록</button>
        </div>
        <div className="between" style={{ marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Oru 버블세럼</div>
            <div className="small" style={{ color: 'var(--gold-ink)', marginTop: 2 }}>함께한 리추얼 {massageN}회</div>
          </div>
          <Ghost onClick={() => toast('실제 앱에서는 Oru 스토어의 버블세럼 재구매 페이지로 연결돼요')}>다시 만나기</Ghost>
        </div>
      </div>

      <div className="sec" style={{ fontSize: 16 }}>배지</div>
      <div className="badges">
        {badges.map((b) => (
          <div key={b[2]}>
            <div className={`b${b[0] ? '' : ' off'}`}>{b[1] || <Icon n={b[2] === '첫 마사지' ? 'face' : 'book'} />}</div>
            <span className={b[0] ? undefined : 'muted'}>{b[2]}</span>
          </div>
        ))}
      </div>

      <div className="sec" style={{ fontSize: 16 }}>리추얼 설정</div>
      <div className="card" style={{ paddingBlock: 2 }}>
        <div className="set">
          <div className="grow"><label htmlFor="setAm">오늘의 문장 알림</label><div className="ds">매일 아침 고정</div></div>
          <select id="setAm" className="field" value={s.am} onChange={(e) => set('am', e.target.value)}>
            {AM.map((t) => <option key={t} value={t}>{amLabel(t)}</option>)}
          </select>
        </div>
        <div className="set">
          <div className="grow"><label htmlFor="setMo">Oru Moment 시간대</label><div className="ds">이 시간대 안에서 예고 없이 한 번</div></div>
          <select id="setMo" className="field" value={s.mo} onChange={(e) => set('mo', e.target.value)}>
            {MO.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
          </select>
        </div>
        <div className="set">
          <div className="grow"><span className="lb">알림 미리보기</span><div className="ds">잠금화면에 오는 모습을 확인해요</div></div>
          <Ghost onClick={() => setOverlay({ type: 'lock', moment: true })}>보기</Ghost>
        </div>
        <div className="set">
          <div className="grow"><label htmlFor="setSound">싱잉볼 소리</label><div className="ds">리추얼 시작과 끝에 울려요</div></div>
          <input id="setSound" type="checkbox" className="sw" checked={s.sound}
            onChange={(e) => { set('sound', e.target.checked); if (e.target.checked) { unlockAudio(); chime({ ...s, sound: true }, 0.6); } }} />
        </div>
        <div className="set" style={{ display: 'block' }}>
          <div className="between">
            <label htmlFor="setVol">싱잉볼 볼륨</label>
            <div className="row" style={{ gap: 10 }}>
              <span className="small muted">{s.vol}%</span>
              <button className="ghost" style={{ background: 'var(--leaf-soft)', color: 'var(--moss)', border: 0, height: 30 }}
                onClick={() => { unlockAudio(); chime(s, 1, true); }}>들어보기</button>
            </div>
          </div>
          <input id="setVol" type="range" min="0" max="100" value={s.vol} style={{ marginTop: 10 }} onChange={(e) => set('vol', +e.target.value)} />
        </div>
        <div className="set">
          <div className="grow"><label htmlFor="setVib">호흡 진동 안내</label><div className="ds">들숨·날숨이 바뀔 때 짧게 진동해요</div></div>
          <input id="setVib" type="checkbox" className="sw" checked={s.vib}
            onChange={(e) => { set('vib', e.target.checked); if (e.target.checked) buzz({ vib: true }, 40); }} />
        </div>
      </div>

      <div className="sec" style={{ fontSize: 16 }}>시연 도구</div>
      <div className="card" style={{ paddingBlock: 2 }}>
        <div className="set">
          <div className="grow"><label htmlFor="setFast">시연 모드 · 4배속</label><div className="ds">1분 호흡이 15초에 끝나요</div></div>
          <input id="setFast" type="checkbox" className="sw" checked={s.fast}
            onChange={(e) => { set('fast', e.target.checked); toast(e.target.checked ? '시연 모드: 타이머가 4배 빠르게 흘러요' : '타이머가 실제 속도로 돌아왔어요'); }} />
        </div>
        <div className="set">
          <div className="grow"><span className="lb">지난 5주 기록 채우기</span><div className="ds">한 줄 기록·마음 체크인 30일 치 · 주간 리포트와 변화 기록 시연용</div></div>
          <Ghost onClick={() => { update(seedDays); toast('지난 5주 기록과 마음 체크인을 채웠어요. 기록 탭 → 나의 변화 기록에서 볼 수 있어요'); }}>채우기</Ghost>
        </div>
        <div className="set">
          <div className="grow"><span className="lb">첫 화면부터 다시 보기</span><div className="ds">기록은 그대로 두고 온보딩만 다시</div></div>
          <Ghost soft onClick={() => { update((n) => { n.onboarded = false; }); go('onboard'); }}>보기</Ghost>
        </div>
        <div className="set">
          <div className="grow"><span className="lb">모든 기록 지우기</span><div className="ds">{armed ? '한 번 더 누르면 모두 지워져요' : '처음 설치한 상태로 돌아가요'}</div></div>
          <Ghost soft={!armed} danger={armed} onClick={wipe}>{armed ? '지우기 확인' : '지우기'}</Ghost>
        </div>
      </div>
      <p className="demo-note">이 프로토타입의 기록은 지금 쓰는 기기의 브라우저에만 저장돼요. 실제 앱에서는 카카오 로그인과 함께 계정에 저장되고, 알림은 휴대폰 잠금화면으로 와요.</p>
    </section>
  );
}
