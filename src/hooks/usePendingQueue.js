import { useEffect, useState } from 'react';
import { getPendingQueue } from '@/lib/synclet/incidentService';

export default function usePendingQueue() {
  const [count, setCount] = useState(getPendingQueue().length);
  useEffect(() => {
    const h = () => setCount(getPendingQueue().length);
    window.addEventListener('synclet:queue', h);
    return () => window.removeEventListener('synclet:queue', h);
  }, []);
  return count;
}