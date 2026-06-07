import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  profile: (uid: string) => ['profile', uid] as const,
  stats: (uid: string) => ['stats', uid] as const,
  today: (uid: string, localDate: string) => ['day', uid, localDate] as const,
  history: (uid: string) => ['history', uid] as const,
  day: (dayId: string) => ['day-by-id', dayId] as const,
};
