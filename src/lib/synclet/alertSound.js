// Control-room audible alarm (browsers require one click to enable audio).
let ctx = null;

export function unlockAudio() {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
}

export const audioEnabled = () => !!ctx && ctx.state === 'running';

export function playAlarm() {
  if (!audioEnabled()) return;
  const start = ctx.currentTime;
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = i % 2 ? 660 : 880;
    const t = start + i * 0.22;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }
}