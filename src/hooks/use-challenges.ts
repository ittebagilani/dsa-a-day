import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challenge.service';

export function useTodaysChallenge() {
  return useQuery({
    queryKey: ['challenge', 'today'],
    queryFn: () => challengeService.getTodaysChallenge(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengeService.getChallengeById(id),
    enabled: !!id,
  });
}

export function usePastChallenges() {
  return useQuery({
    queryKey: ['challenges', 'past'],
    queryFn: () => challengeService.getPastChallenges(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
