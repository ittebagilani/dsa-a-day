import { supabase } from '@/lib/supabase';

export interface UserProgress {
  id: string;
  user_id: string;
  challenge_id: number;
  status: 'unsolved' | 'solved' | 'failed';
  attempts: number;
  hints_used: number;
  user_answer: string | null;
  time_spent_seconds: number;
  solved_at: string | null;
}

export const progressService = {
  async getUserProgress(challengeId: number): Promise<UserProgress | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found is OK
      console.error('Error fetching progress:', error);
    }

    return data as UserProgress | null;
  },

  async updateProgress(
    challengeId: number,
    updates: Partial<UserProgress>
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: user.id,
        challenge_id: challengeId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,challenge_id',
      }
    );

    if (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  async recordAttempt(
    challengeId: number,
    isCorrect: boolean,
    userAnswer: string,
    hintsUsed: number
  ): Promise<void> {
    const currentProgress = await this.getUserProgress(challengeId);
    const attempts = (currentProgress?.attempts || 0) + 1;

    await this.updateProgress(challengeId, {
      status: isCorrect ? 'solved' : attempts >= 3 ? 'failed' : 'unsolved',
      attempts,
      hints_used: hintsUsed,
      user_answer: userAnswer,
      solved_at: isCorrect ? new Date().toISOString() : currentProgress?.solved_at || null,
    });
  },
};
