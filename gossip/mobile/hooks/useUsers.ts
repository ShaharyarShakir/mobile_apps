import { useApi } from '@/ib/axios';
import type { User } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useUsers = () => {
  const { apiWithAuth } = useApi();
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiWithAuth<User[]>({ method: 'GET', url: '/users' });
      return data;
    },
  });
};
