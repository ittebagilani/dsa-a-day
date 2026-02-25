import { Router } from 'express';
import { getCollection } from '../lib/mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user subscription
router.get('/:userId', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;
    if (req.user?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const subscriptions = await getCollection('subscriptions');
    
    const subscription = await subscriptions.findOne({ user_id: userId });
    
    if (!subscription) {
      // If no subscription is found, return a default "free" subscription
      const defaultFreeSubscription = {
        user_id: userId,
        plan_type: 'free',
        status: 'active', // Default status for a free plan
        // You might want to add other default fields like start_date, end_date, etc.
      };
      return res.json(defaultFreeSubscription);
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
