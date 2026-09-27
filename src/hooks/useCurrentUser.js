import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useCurrentUser() {
  return useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me(), staleTime: 60_000 });
}

export async function saveMe(queryClient, data) {
  await base44.auth.updateMe(data);
  await queryClient.invalidateQueries({ queryKey: ['me'] });
}