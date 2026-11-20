import { useLayoutEffect, useRef } from 'react';
import { MOVES } from '../data/content.js';

const G = '#3F6B4A';

function Badge({ x, y, t, gRef }) {
  return (
    <g ref={gRef} transform={`translate(${x} ${y})`}>
      <circle r="10" fill={G} stroke="#FFFFFF" strokeWidth="2" />
      <text y="4" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="12" fontWeight="700" fill="#FFFFFF">{t}</text>
    </g>
  );
}

function Ripple({ r, gRef }) {
  return (
    <g ref={gRef} className="rip" transform={`translate(${r[0]} ${r[1]})`}>
      <circle className="r3" r="14" fill="none" stroke={G} strokeWidth="1.5" opacity=".35" />
      <circle className="r2" r="9" fill="none" stroke={G} strokeWidth="1.5" strokeDasharray="3 3" opacity=".75" />
      <circle r="4" fill={G} />
    </g>
  );
}

/**
 * The Oru character with the massage path for move `mi`.
 * ① start point, ② direction (placed at the path's midpoint), ③ press point.
 * Pass `anim` (refs for path / fingers / ripples) to animate it from outside.
 */
export default function Face({ mi, uid = '', anim }) {
  const M = MOVES[mi];
  const [, sx, sy] = M.path.match(/^M([\d.]+) ([\d.]+)/).map(Number);
  const pathRef = useRef(null);
  const b2Ref = useRef(null);
  const marker = `oruArr${uid}`;

  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p || !b2Ref.current) return;
    const m = p.getPointAtLength(p.getTotalLength() / 2);
    b2Ref.current.setAttribute('transform', `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})`);
  }, [mi]);

  const setPath = (el) => { pathRef.current = el; if (anim) anim.path.current = el; };
  const halo = <path d={M.path} fill="none" stroke="#A8C98E" strokeWidth="12" strokeLinecap="round" opacity=".5" />;
  const finger = (r) => <circle ref={r} cx={sx} cy={sy} r="8" fill="#FFFFFF" stroke={G} strokeWidth="3" opacity="0" />;

  return (
    <svg viewBox="0 0 320 244" role="img" aria-label={`${M.n} 방향 안내. 1 시작점, 2 쓸어가는 방향, 3 지그시 누르는 지점`}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M1 1L9 5L1 9z" fill={G} />
        </marker>
      </defs>
      <path d="M58 244C66 222 104 212 136 210L136 176L184 176L184 210C216 212 254 222 262 244Z" fill="#FFF6EC" stroke="#14332A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M112 234q14-5 24-3M208 234q-14-5-24-3" fill="none" stroke="#14332A" strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
      <circle cx="96" cy="60" r="20" fill="#9C7A62" stroke="#14332A" strokeWidth="2.5" /><circle cx="96" cy="60" r="10" fill="#F4C7BB" />
      <circle cx="224" cy="60" r="20" fill="#9C7A62" stroke="#14332A" strokeWidth="2.5" /><circle cx="224" cy="60" r="10" fill="#F4C7BB" />
      <ellipse cx="160" cy="124" rx="86" ry="72" fill="#FFF6EC" stroke="#14332A" strokeWidth="2.5" />
      <path d="M76 110C72 68 110 46 160 46C210 46 248 68 244 110C238 100 232 94 224 90C216 99 202 101 193 92C183 101 169 103 160 94C151 103 137 101 127 92C118 101 104 99 96 90C88 94 82 100 76 110Z" fill="#9C7A62" stroke="#14332A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M118 62q20-9 42-8" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".35" />
      <ellipse cx="128" cy="118" rx="7.5" ry="9.5" fill="#14332A" /><ellipse cx="192" cy="118" rx="7.5" ry="9.5" fill="#14332A" />
      <circle cx="130.5" cy="114" r="2.8" fill="#FFFFFF" /><circle cx="194.5" cy="114" r="2.8" fill="#FFFFFF" />
      <circle cx="126" cy="122" r="1.3" fill="#FFFFFF" /><circle cx="190" cy="122" r="1.3" fill="#FFFFFF" />
      <ellipse cx="104" cy="134" rx="11" ry="6.5" fill="#F4B8A8" opacity=".8" /><ellipse cx="216" cy="134" rx="11" ry="6.5" fill="#F4B8A8" opacity=".8" />
      <ellipse cx="160" cy="135" rx="4.5" ry="3.2" fill="#E59A8A" />
      <path d="M152 143q4 6 8 0q4 6 8 0" fill="none" stroke="#14332A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {halo}
      <path ref={setPath} d={M.path} fill="none" stroke={G} strokeWidth="4" strokeLinecap="round" markerEnd={`url(#${marker})`} />
      <Ripple r={M.r} gRef={anim && anim.ripL} />
      <g transform="translate(320 0) scale(-1 1)">
        {halo}
        <path d={M.path} fill="none" stroke={G} strokeWidth="4" strokeLinecap="round" markerEnd={`url(#${marker})`} />
        <Ripple r={M.r} gRef={anim && anim.ripR} />
        <circle cx={sx} cy={sy} r="6" fill="#A8C98E" stroke={G} strokeWidth="2" />
        {finger(anim && anim.fR)}
      </g>
      <Badge x={sx} y={sy} t="1" />
      <Badge x={sx} y={sy} t="2" gRef={b2Ref} />
      <Badge x={M.b3[0]} y={M.b3[1]} t="3" />
      {finger(anim && anim.fL)}
    </svg>
  );
}
