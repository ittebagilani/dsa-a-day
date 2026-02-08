import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/services/progress.service';

export function useUserProgress(challengeId: number) {
  return useQuery({
    queryKey: ['progress', challengeId],
    queryFn: () => progressService.getUserProgress(challengeId),
    enabled: !!challengeId,
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
    }: {
      challengeId: number;
      isCorrect: boolean;
      userAnswer: string;
      hintsUsed: number;
    }) =>
      progressService.recordAttempt(challengeId, isCorrect, userAnswer, hintsUsed),
    onSuccess: (_, variables) => {
      // Invalidate progress query to refetch
      queryClient.invalidateQueries({ queryKey: ['progress', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
