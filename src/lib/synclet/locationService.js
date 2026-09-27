// Uses phone GPS when enabled; otherwise returns a clearly labelled fallback location.
import { FALLBACK_LOCATION } from './constants';

const jitter = () => (Math.random() - 0.5) * 0.002;

const fallbackLocation = () => ({
  lat: +(FALLBACK_LOCATION.lat + jitter()).toFixed(5),
  lng: +(FALLBACK_LOCATION.lng + jitter()).toFixed(5),
  label: FALLBACK_LOCATION.label,
  simulated: true,
});

export async function getLocation({ useDevice, coarse = false }) {
  const round = (value) => (coarse ? +value.toFixed(2) : +value.toFixed(5));
  if (!useDevice || !navigator.geolocation) {
    const fallback = fallbackLocation();
    return { ...fallback, lat: round(fallback.lat), lng: round(fallback.lng) };
  }
  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 30000 }),
    );
    return {
      lat: round(position.coords.latitude),
      lng: round(position.coords.longitude),
      label: `Phone GPS position${coarse ? ' (approx. ±1 km)' : ''}`,
      simulated: false,
    };
  } catch {
    const fallback = fallbackLocation();
    return { ...fallback, lat: round(fallback.lat), lng: round(fallback.lng), label: `${FALLBACK_LOCATION.label} (GPS unavailable)` };
  }
}
