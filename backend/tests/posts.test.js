import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

await jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    scheduledPost: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        content: 'Hello',
        mediaUrl: null,
        scheduledFor: new Date().toISOString(),
        platform: 'twitter',
      }),
    },
  },
}));

await jest.unstable_mockModule('../src/queue/postWorker.js', () => ({
  postQueue: { add: jest.fn() },
}));

await jest.unstable_mockModule('../src/realtime.js', () => ({
  emitScheduleUpdate: jest.fn(),
}));

const postsRoutes = (await import('../src/routes/posts.js')).default;
const prisma = (await import('../src/config/db.js')).default;
const { postQueue } = await import('../src/queue/postWorker.js');
const { emitScheduleUpdate } = await import('../src/realtime.js');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRoutes);

describe('Post scheduling', () => {
  it('schedules a post', async () => {
    const payload = {
      userId: 1,
      content: 'Hello',
      mediaUrl: null,
      platform: 'twitter',
      scheduledFor: new Date().toISOString(),
    };
    const res = await request(app).post('/api/posts/schedule').send(payload);
    expect(res.status).toBe(200);
    expect(prisma.scheduledPost.create).toHaveBeenCalled();
    expect(postQueue.add).toHaveBeenCalled();
    expect(emitScheduleUpdate).toHaveBeenCalled();
    expect(res.body).toMatchObject({ userId: 1, content: 'Hello', platform: 'twitter' });
  });
});
