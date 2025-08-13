// Post scheduling routes
import { Router } from 'express';
import prisma from '../config/db.js';
import { postQueue } from '../queue/postWorker.js';
import { emitScheduleUpdate } from '../realtime.js';
import auth from '../middleware/auth.js';

const router = Router();

// Schedule a post
router.post('/schedule', async (req, res) => {
  const { userId, content, mediaUrl, scheduledFor, platform } = req.body;
  try {
    const post = await prisma.scheduledPost.create({
      data: {
        userId,
        content,
        mediaUrl,
        scheduledFor: new Date(scheduledFor),
        platform,
      },
    });

    const delay = new Date(scheduledFor).getTime() - Date.now();
    await postQueue.add('post', { postId: post.id }, { delay: Math.max(delay, 0) });

    emitScheduleUpdate(post);
    res.json(post);
  } catch (err) {
    console.error('Schedule post failed', err);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

// Retrieve scheduled posts for authenticated user
router.get('/schedule', auth, async (req, res) => {
  try {
    const posts = await prisma.scheduledPost.findMany({
      where: { userId: req.user.id },
      orderBy: { scheduledFor: 'asc' },
    });
    res.json(posts);
  } catch (err) {
    console.error('Fetch scheduled posts failed', err);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

export default router;
