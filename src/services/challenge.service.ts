// In a real app, these would call your backend API
// For now, we'll use the data directly from the challenges file
import { challenges } from '@/data/challenges';

export interface Challenge {
  id: number;
  date: string;
  type: 'bug-fix' | 'complete-line' | 'find-problem';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  code: string;
  bugLine: number | null;
  correctAnswer: string;
  hints: string[];
  explanation: string;
}

export const challengeService = {
  async getTodaysChallenge(): Promise<Challenge | null> {
    const today = new Date().toISOString().split('T')[0];
    const challenge = challenges.find(c => c.date === today);
    return challenge || null;
  },

  async getChallengeById(id: number): Promise<Challenge | null> {
    const challenge = challenges.find(c => c.id === id);
    return challenge || null;
  },

  async getPastChallenges(): Promise<Challenge[]> {
    const today = new Date().toISOString().split('T')[0];
    return challenges
      .filter(c => c.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
};
