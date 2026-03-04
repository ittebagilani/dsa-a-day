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
      status,
      userAnswer,
      hintsUsed,
      timeTaken,
      solvedBugIndices,
    }: {
      challengeId: number;
      status: 'unsolved' | 'solved' | 'failed';
      userAnswer: string;
      hintsUsed: number;
      timeTaken: number;
      solvedBugIndices: number[];
    }) =>
      progressService.recordAttempt(challengeId, status, userAnswer, hintsUsed, timeTaken, solvedBugIndices),
    onSuccess: (_, variables) => {
      // Invalidate progress query to refetch
      queryClient.invalidateQueries({ queryKey: ['progress', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'solved'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'account-stats'] });
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

export function useAccountStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['progress', 'account-stats'],
    queryFn: () => progressService.getAccountStats(),
    enabled: !!user,
  });
}
