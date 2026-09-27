import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// The demo user's incidents. `live: true` listens for localStorage-backed updates (use once, in the layout).
export default function useMyIncidents(user, { live = false } = {}) {
  const qc = useQueryClient();
  const key = ['my-incidents', user?.id];

  const query = useQuery({
    queryKey: key,
    queryFn: () => base44.entities.Incident.filter({ created_by_id: user.id }, '-created_date', 30),
    enabled: !!user,
  });

  useEffect(() => {
    if (!live || !user) return;
    return base44.entities.Incident.subscribe(() => qc.invalidateQueries({ queryKey: ['my-incidents', user.id] }));
  }, [live, user?.id]);

  return query;
}