/* Singing-bowl chime (WebAudio), vibration, screen wake lock. */
let AC = null;
let wl = null;

export function unlockAudio() {
  try {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) AC = new C();
    }
    if (AC && AC.state === 'suspended') AC.resume();
  } catch (e) { /* audio unavailable */ }
}

export function chime(settings, level = 1, force = false) {
  if ((!settings.sound && !force) || !AC) return;
  try {
    const t = AC.currentTime, master = AC.createGain();
    master.gain.value = (settings.vol / 100) * 0.22 * level;
    master.connect(AC.destination);
    [[220, 1, 6], [220.9, 0.6, 6], [528, 0.45, 4.5], [531, 0.3, 4.5], [1047, 0.16, 3]].forEach((p) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine';
      o.frequency.value = p[0];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p[1], t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + p[2] + 0.1);
    });
  } catch (e) { /* ignore */ }
}

export function buzz(settings, ms = 30) {
  if (!settings.vib) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ }
}

export function keepAwake() {
  try {
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then((l) => { wl = l; }).catch(() => {});
  } catch (e) { /* ignore */ }
}
export function releaseWake() {
  try { if (wl) wl.release(); } catch (e) { /* ignore */ }
  wl = null;
}
