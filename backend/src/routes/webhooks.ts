import { Router } from 'express';
import Stripe from 'stripe';
import { getCollection } from '../lib/mongodb';
import { requireEnv } from '../lib/env';

const router = Router();
const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.userId;
    if (userId) {
      try {
        const subscriptions = await getCollection('subscriptions');
        
        // Update or insert subscription
        await subscriptions.updateOne(
          { user_id: userId },
          { 
            $set: { 
              plan_type: 'pro',
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date()
            } 
          },
          { upsert: true }
        );
        
        console.log(`Updated subscription for user: ${userId}`);
      } catch (error) {
        console.error('Error updating subscription in database:', error);
        return res.status(500).json({ error: 'Database update failed' });
      }
    }
  }

  res.json({ received: true });
});

export default router;
