import { useEffect, useRef, useState } from 'react';
import { keepAwake, releaseWake } from './sound.js';

/**
 * rAF timer: runs `dur` seconds, calls onTick(elapsed) every frame and onDone() once.
 * Restarts whenever `key` changes. Supports pause, and demo fast mode (×4).
 * Pauses automatically when the page is hidden.
 */
export function useRunner({ dur, key, fast, onTick, onDone, active = true }) {
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const cbs = useRef({ onTick, onDone, fast });
  cbs.current = { onTick, onDone, fast };

  useEffect(() => {
    if (!active) return undefined;
    pausedRef.current = false;
    setPaused(false);
    keepAwake();
    let el = 0, last = null, raf = 0, done = false;
    const f = (t) => {
      if (last === null) last = t;
      const dt = Math.min(t - last, 250);
      last = t;
      if (!pausedRef.current) el += (dt / 1000) * (cbs.current.fast ? 4 : 1);
      if (el >= dur) {
        cbs.current.onTick(dur);
        done = true;
        cbs.current.onDone();
        return;
      }
      cbs.current.onTick(el);
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    const onVis = () => {
      if (document.hidden && !pausedRef.current) { pausedRef.current = true; setPaused(true); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (!done) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      releaseWake();
    };
  }, [key, dur, active]);

  const toggle = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); };
  return { paused, toggle };
}
