import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = not found
        console.error("Error fetching today's challenge:", error);
      }
      return null;
    }

    return this.transformChallenge(data);
  },

  async getChallengeById(id: number): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }

    return this.transformChallenge(data);
  },

  async getPastChallenges(): Promise<Challenge[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .lt('date', today)
      .eq('is_active', true)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching past challenges:', error);
      return [];
    }

    return data.map(this.transformChallenge);
  },

  transformChallenge(data: any): Challenge {
    return {
      id: data.id,
      date: data.date,
      type: data.type,
      difficulty: data.difficulty,
      title: data.title,
      description: data.description,
      code: data.code,
      bugLine: data.bug_line,
      correctAnswer: data.correct_answer,
      hints: data.hints || [],
      explanation: data.explanation,
    };
  },
};
