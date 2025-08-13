// Onboarding routes
import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use(authenticate);

// Collect profile details
router.post('/profile', async (req, res) => {
  const { name } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
    res.json(user);
  } catch (err) {
    console.error('Profile update failed', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Mark onboarding as complete
router.post('/complete', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingComplete: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Onboarding completion failed', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
