import { Router } from 'express';
import { getCollection } from '../lib/mongodb';

const router = Router();

// Get today's challenge
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const collection = await getCollection('challenges');
    
    const challenge = await collection.findOne({
      date: today,
      is_active: true
    });
    
    if (!challenge) {
      return res.status(404).json({ error: 'No challenge found for today' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching today\'s challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const collection = await getCollection('challenges');
    
    const challenge = await collection.findOne({
      id: id,
      is_active: true
    });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get past challenges
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const collection = await getCollection('challenges');
    
    const challenges = await collection
      .find({
        date: { $lt: today },
        is_active: true
      })
      .sort({ date: -1 })
      .toArray();
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching past challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;