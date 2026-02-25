import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/services/progress.service';
import { useAuth } from '@/contexts/AuthContext';

export function useUserProgress(challengeId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['progress', challengeId],
    queryFn: () => progressService.getUserProgress(challengeId),
    enabled: !!challengeId && !!user,
  });
}

export function useRecordAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      isCorrect,
      userAnswer,
      hintsUsed,
      timeTaken,
    }: {
      challengeId: number;
      isCorrect: boolean;
      userAnswer: string;
      hintsUsed: number;
      timeTaken: number;
    }) =>
      progressService.recordAttempt(challengeId, isCorrect, userAnswer, hintsUsed, timeTaken),
    onSuccess: (_, variables) => {
      // Invalidate progress query to refetch
      queryClient.invalidateQueries({ queryKey: ['progress', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useSolvedChallenges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['progress', 'solved'],
    queryFn: () => progressService.getSolvedChallenges(),
    enabled: !!user,
  });
}
