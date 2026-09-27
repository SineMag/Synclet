export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB') : '—');

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const fmtElapsed = (fromIso, toMs = Date.now()) => {
  const s = Math.max(0, Math.floor((toMs - new Date(fromIso).getTime()) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};