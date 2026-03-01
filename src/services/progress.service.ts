const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface UserProgress {
  user_id: string;
  challenge_id: number;
  status: 'unsolved' | 'solved' | 'failed';
  attempts: number;
  hints_used: number;
  user_answer: string | null;
  time_spent_seconds: number;
  xp_earned?: number;
  solved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SolvedChallengeProgress {
  challenge_id: number;
  attempts: number;
  hints_used: number;
  time_spent_seconds: number;
  solved_at: string | null;
  updated_at: string;
  challenge_title: string | null;
  challenge_date: string | null;
  challenge_difficulty: 'easy' | 'medium' | 'hard' | null;
  challenge_type: 'bug-fix' | 'complete-line' | 'find-problem' | null;
}

export interface AccountStats {
  total_xp: number;
  streak: number;
  solved_count: number;
}

export const progressService = {
  getAuthHeader() {
    const token = localStorage.getItem('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async getUserProgress(challengeId: number): Promise<UserProgress | null> {
    const response = await fetch(`${API_URL}/progress/${challengeId}`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!response.ok) return null;
    return response.json();
  },

  async getSolvedChallenges(): Promise<SolvedChallengeProgress[]> {
    const response = await fetch(`${API_URL}/progress/me/solved`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!response.ok) return [];
    return response.json();
  },

  async getAccountStats(): Promise<AccountStats> {
    const response = await fetch(`${API_URL}/progress/me/stats`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!response.ok) {
      return { total_xp: 0, streak: 0, solved_count: 0 };
    }
    return response.json();
  },

  async recordAttempt(
    challengeId: number,
    status: 'unsolved' | 'solved' | 'failed',
    userAnswer: string,
    hintsUsed: number,
    timeTaken: number
  ): Promise<{ xpEarned?: number; newStreak?: number }> {
    const response = await fetch(`${API_URL}/progress/${challengeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({
        status,
        user_answer: userAnswer,
        hints_used: hintsUsed,
        time_spent_seconds: timeTaken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record attempt');
    }

    return response.json();
  },
};
