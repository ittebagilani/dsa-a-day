import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getCollection } from '../lib/mongodb';

const router = Router();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

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
    const updates = req.body;
    
    const collection = await getCollection('user_progress');
    const now = new Date();
    
    const updateData = {
      ...updates,
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
    
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;