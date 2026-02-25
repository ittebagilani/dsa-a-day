import { Router } from 'express';
import { getCollection } from '../lib/mongodb';

const router = Router();

// Get top users for leaderboard
router.get('/', async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    // Fetch top 20 users by XP
    const topUsers = await usersCollection
      .find({}, { 
        projection: { 
          name: 1, 
          email: 1, 
          xp: 1, 
          streak: 1,
          id: 1
        } 
      })
      .sort({ xp: -1 })
      .limit(20)
      .toArray();

    // Map to a cleaner format for the frontend
    const leaderboard: any[] = [];
    topUsers.forEach((user: any, index: number) => {
      leaderboard.push({
        rank: index + 1,
        username: user.name || user.email.split('@')[0],
        xp: user.xp || 0,
        streak: user.streak || 0,
        userId: user.id
      });
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
