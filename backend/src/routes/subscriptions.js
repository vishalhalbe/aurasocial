// Subscription management routes
import { Router } from 'express';
import Stripe from 'stripe';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Stripe webhook (no auth)
router.post('/webhook', async (req, res) => {
  const event = req.body;
  try {
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object;
      await prisma.subscription.update({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err);
    res.status(400).send('Webhook error');
  }
});

router.use(authenticate);

// Create Stripe customer for the user
router.post('/create-customer', async (req, res) => {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (subscription?.stripeCustomer) {
      return res.json({ customerId: subscription.stripeCustomer });
    }

    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { userId: req.user.id },
        data: { stripeCustomer: customer.id },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: req.user.id,
          stripeCustomer: customer.id,
          stripeSubId: '',
          plan: '',
          status: 'incomplete',
          currentPeriodEnd: new Date(),
        },
      });
    }

    res.json({ customerId: customer.id });
  } catch (err) {
    console.error('Create customer failed', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Subscribe user to a plan
router.post('/subscribe', async (req, res) => {
  const { priceId } = req.body;
  try {
    let subscriptionRecord = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    let customerId = subscriptionRecord?.stripeCustomer;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      if (subscriptionRecord) {
        await prisma.subscription.update({
          where: { userId: req.user.id },
          data: { stripeCustomer: customerId },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: req.user.id,
            stripeCustomer: customerId,
            stripeSubId: '',
            plan: '',
            status: 'incomplete',
            currentPeriodEnd: new Date(),
          },
        });
      }
    }

    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });

    await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        stripeSubId: sub.id,
        plan: priceId,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    });

    res.json({ subscriptionId: sub.id });
  } catch (err) {
    console.error('Subscribe failed', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
