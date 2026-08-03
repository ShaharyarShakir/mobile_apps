import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

export interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  details: string | null;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: ServiceStatus;
  redis: ServiceStatus;
  environment: string;
}

export const useHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    },
    refetchInterval: 10000, // Poll health status every 10 seconds to monitor connection changes
    retry: 2,
  });
};
export default useHealth;
