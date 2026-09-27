// locationService — real phone GPS when enabled, otherwise a clearly-labelled simulated demo location.
import { DEMO_LOCATION } from './constants';

const jitter = () => (Math.random() - 0.5) * 0.002;

const demoLocation = () => ({
  lat: +(DEMO_LOCATION.lat + jitter()).toFixed(5),
  lng: +(DEMO_LOCATION.lng + jitter()).toFixed(5),
  label: DEMO_LOCATION.label,
  simulated: true,
});

export async function getLocation({ useDevice, coarse = false }) {
  const round = (n) => (coarse ? +n.toFixed(2) : +n.toFixed(5));
  if (!useDevice || !navigator.geolocation) {
    const d = demoLocation();
    return { ...d, lat: round(d.lat), lng: round(d.lng) };
  }
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 30000 })
    );
    return { lat: round(pos.coords.latitude), lng: round(pos.coords.longitude), label: `Phone GPS position${coarse ? ' (approx. ±1 km)' : ''}`, simulated: false };
  } catch {
    const d = demoLocation();
    return { ...d, lat: round(d.lat), lng: round(d.lng), label: `${DEMO_LOCATION.label} (GPS unavailable)` };
  }
}