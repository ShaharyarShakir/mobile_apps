import { useApi } from '@/ib/axios';
import { User } from '@sentry/react-native';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAuthCallback = () => {
  const { apiWithAuth } = useApi();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiWithAuth<User>({
        method: 'POST',
        url: '/auth/callback',
      });
      return data;
    },
  });
};

export const useCurrentUser = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiWithAuth<User>({method: 'GET', url: '/auth/me'});
      return data;
    },
  });
};
