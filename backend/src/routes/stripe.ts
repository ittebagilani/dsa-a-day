import { Router } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth';
import { optionalCsvEnv, requireEnv } from '../lib/env';
import { captureEvent } from '../lib/analytics';
import { getCollection } from '../lib/mongodb';

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

    void captureEvent({
      distinctId: userId,
      event: 'checkout_session_created_server',
      properties: {
        price_id: priceId,
        checkout_session_id: session.id,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-portal-session', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscriptions = await getCollection('subscriptions');
    const userSubscription = await subscriptions.findOne({ user_id: userId });

    if (!userSubscription) {
      return res.status(400).json({ error: 'No subscription found for this user' });
    }

    let stripeCustomerId = userSubscription.stripe_customer_id as string | undefined;
    const stripeSubscriptionId = userSubscription.stripe_subscription_id as string | undefined;

    if (!stripeCustomerId && stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const customer = stripeSub.customer;
      if (typeof customer === 'string') {
        stripeCustomerId = customer;
        await subscriptions.updateOne(
          { user_id: userId },
          { $set: { stripe_customer_id: stripeCustomerId, updated_at: new Date() } }
        );
      }
    }

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found for this user' });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${FRONTEND_URL}/pricing`,
    });

    void captureEvent({
      distinctId: userId,
      event: 'billing_portal_opened_server',
      properties: {
        stripe_customer_id: stripeCustomerId,
      },
    });

    return res.json({ url: portal.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

export default router;
