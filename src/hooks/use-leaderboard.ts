import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  streak: number;
  xp: number;
  userId: string;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const response = await fetch(`${API_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return response.json();
    },
  });
}
