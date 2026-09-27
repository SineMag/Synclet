// PII masking helpers — shared by the control room settings and incident detail.
const KEY = 'synclet.showPII';

export const getShowPii = () => localStorage.getItem(KEY) === 'true';
export const setShowPii = (v) => localStorage.setItem(KEY, String(v));

export const maskPhone = (phone, show) => {
  if (!phone) return '—';
  if (show) return phone;
  return `${phone.slice(0, 3)}•••••${phone.slice(-2)}`;
};