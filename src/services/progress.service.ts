// In a real app, these would call your backend API
// For now, we'll use mock data
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  user_id: string;
  challenge_id: number;
  status: 'unsolved' | 'solved' | 'failed';
  attempts: number;
  hints_used: number;
  user_answer: string | null;
  time_spent_seconds: number;
  solved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Mock in-memory storage for progress
const mockProgressStore: Record<string, UserProgress> = {};

export const progressService = {
  async getUserProgress(challengeId: number): Promise<UserProgress | null> {
    // In a real app, you'd get the user from context
    // For now, return null since we don't have persistent storage
    return null;
  },

  async updateProgress(
    userId: string,
    challengeId: number,
    updates: Partial<Omit<UserProgress, 'user_id' | 'challenge_id' | 'created_at'>>
  ): Promise<void> {
    const key = `${userId}-${challengeId}`;
    const now = new Date();
    
    mockProgressStore[key] = {
      user_id: userId,
      challenge_id: challengeId,
      status: 'unsolved',
      attempts: 0,
      hints_used: 0,
      user_answer: null,
      time_spent_seconds: 0,
      solved_at: null,
      created_at: now,
      updated_at: now,
      ...mockProgressStore[key],
      ...updates,
    };
  },

  async recordAttempt(
    userId: string,
    challengeId: number,
    isCorrect: boolean,
    userAnswer: string,
    hintsUsed: number
  ): Promise<void> {
    const key = `${userId}-${challengeId}`;
    const currentProgress = mockProgressStore[key] || {
      attempts: 0,
      hints_used: 0,
      solved_at: null,
    };
    
    const attempts = currentProgress.attempts + 1;
    
    await this.updateProgress(userId, challengeId, {
      status: isCorrect ? 'solved' : attempts >= 3 ? 'failed' : 'unsolved',
      attempts,
      hints_used: hintsUsed,
      user_answer: userAnswer,
      solved_at: isCorrect ? new Date() : currentProgress.solved_at,
    });
  },
  
  async getUserProgressByUserId(userId: string, challengeId: number): Promise<UserProgress | null> {
    const key = `${userId}-${challengeId}`;
    return mockProgressStore[key] || null;
  },
};
