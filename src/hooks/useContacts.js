import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useContacts(user) {
  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: () => base44.entities.EmergencyContact.filter({ created_by_id: user.id }, 'created_date'),
    enabled: !!user,
  });
}