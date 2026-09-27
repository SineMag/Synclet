import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Tracks whether this screen can reach the live backend (browser online + periodic ping).
export default function useConnection() {
  const [online, setOnline] = useState(navigator.onLine);
  const [reachable, setReachable] = useState(true);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    const ping = () =>
      base44.entities.Incident.list('-created_date', 1)
        .then(() => setReachable(true))
        .catch(() => setReachable(false));
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    const t = setInterval(ping, 15000);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
      clearInterval(t);
    };
  }, []);

  return { connected: online && reachable };
}