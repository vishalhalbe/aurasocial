// Post scheduling routes
import { Router } from 'express';
import prisma from '../config/db.js';
import { postQueue } from '../queues/postWorker.js';
import { emitScheduleUpdate } from '../realtime.js';

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

export default router;
