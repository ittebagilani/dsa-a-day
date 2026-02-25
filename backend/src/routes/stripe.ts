import { Router } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth';
import { optionalCsvEnv, requireEnv } from '../lib/env';

const router = Router();
const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
const FRONTEND_URL = requireEnv('FRONTEND_URL');
const allowedPriceIds = optionalCsvEnv('STRIPE_ALLOWED_PRICE_IDS');

router.post('/create-checkout-session', authenticateToken, async (req: any, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.userId;

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing priceId or userId' });
    }

    if (allowedPriceIds.length > 0 && !allowedPriceIds.includes(priceId)) {
      return res.status(400).json({ error: 'Invalid priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/pricing`,
      metadata: {
        userId: userId,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
