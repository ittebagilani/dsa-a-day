import { Router } from 'express';
import { getCollection } from '../lib/mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all solved challenges for the authenticated user
router.get('/me/solved', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const collection = await getCollection('user_progress');

    const solved = await collection.aggregate([
      {
        $match: {
          user_id: userId,
          status: 'solved',
        },
      },
      {
        $lookup: {
          from: 'challenges',
          let: { challengeId: '$challenge_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$challengeId'] },
              },
            },
            {
              $project: {
                _id: 0,
                id: 1,
                title: 1,
                date: 1,
                difficulty: 1,
                type: 1,
              },
            },
          ],
          as: 'challenge',
        },
      },
      {
        $unwind: {
          path: '$challenge',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          challenge_id: 1,
          attempts: { $ifNull: ['$attempts', 0] },
          hints_used: { $ifNull: ['$hints_used', { $ifNull: ['$hintsUsed', 0] }] },
          time_spent_seconds: 1,
          solved_at: 1,
          updated_at: 1,
          challenge_title: '$challenge.title',
          challenge_date: '$challenge.date',
          challenge_difficulty: '$challenge.difficulty',
          challenge_type: '$challenge.type',
        },
      },
      {
        $sort: {
          solved_at: -1,
          updated_at: -1,
        },
      },
    ]).toArray();

    res.json(solved);
  } catch (error) {
    console.error('Error fetching solved challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress for a challenge
router.get('/:challengeId', authenticateToken, async (req: any, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const userId = req.user.userId;
    
    const collection = await getCollection('user_progress');
    const progress = await collection.findOne({
      user_id: userId,
      challenge_id: challengeId,
    });
    
    res.json(progress || null);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user progress
router.post('/:challengeId', authenticateToken, async (req: any, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const userId = req.user.userId;
    const updates = req.body as {
      status?: 'unsolved' | 'solved' | 'failed';
      user_answer?: string;
      hints_used?: number;
      hintsUsed?: number;
      time_spent_seconds?: number;
    };
    
    const collection = await getCollection('user_progress');
    const users = await getCollection('users');
    const challenges = await getCollection('challenges');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get challenge details for XP calculation
    const challenge = await challenges.findOne({ id: challengeId });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if moving to solved state
    const existingProgress = await collection.findOne({ user_id: userId, challenge_id: challengeId });
    const nextStatus = updates.status;
    if (!nextStatus || !['unsolved', 'solved', 'failed'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const normalizedHintsUsedRaw = updates.hints_used ?? updates.hintsUsed;
    const normalizedHintsUsed = Number.isFinite(normalizedHintsUsedRaw)
      ? Math.max(0, Math.floor(Number(normalizedHintsUsedRaw)))
      : (existingProgress?.hints_used ?? existingProgress?.hintsUsed ?? 0);

    const nextAttempts = Math.max(0, (existingProgress?.attempts ?? 0) + 1);
    const isFirstSolve = nextStatus === 'solved' && (!existingProgress || existingProgress.status !== 'solved');

    let xpEarned = 0;
    let newStreak = 0;

    if (isFirstSolve) {
      // Calculate XP
      const baseXP = challenge.difficulty === 'easy' ? 100 : challenge.difficulty === 'medium' ? 200 : 300;
      const penalty = normalizedHintsUsed * 0.2;
      xpEarned = Math.max(0, Math.floor(baseXP * (1 - penalty)));

      // Calculate Streak
      const user = await users.findOne({ id: userId });
      const lastSolvedDate = user?.last_solved_date;
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastSolvedDate === yesterdayStr) {
        newStreak = (user.streak || 0) + 1;
      } else if (lastSolvedDate === today) {
        newStreak = user.streak || 1;
      } else {
        newStreak = 1;
      }

      // Update User total XP and Streak
      await users.updateOne(
        { id: userId },
        { 
          $inc: { xp: xpEarned },
          $set: { 
            streak: newStreak,
            last_solved_date: today
          }
        }
      );
    }

    const updateData = {
      status: nextStatus,
      user_answer: typeof updates.user_answer === 'string' ? updates.user_answer : (existingProgress?.user_answer ?? null),
      attempts: nextAttempts,
      hints_used: Math.max(existingProgress?.hints_used ?? 0, normalizedHintsUsed),
      time_spent_seconds: Number.isFinite(updates.time_spent_seconds)
        ? Math.max(0, Math.floor(Number(updates.time_spent_seconds)))
        : (existingProgress?.time_spent_seconds ?? 0),
      solved_at: isFirstSolve ? now : (existingProgress?.solved_at ?? null),
      xp_earned: isFirstSolve ? xpEarned : (existingProgress?.xp_earned || 0),
      updated_at: now,
    };
    
    await collection.updateOne(
      {
        user_id: userId,
        challenge_id: challengeId,
      },
      {
        $set: updateData,
        $setOnInsert: {
          user_id: userId,
          challenge_id: challengeId,
          created_at: now,
        },
      },
      { upsert: true }
    );
    
    res.json({ 
      message: 'Progress updated successfully',
      xpEarned,
      newStreak: isFirstSolve ? newStreak : undefined
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
