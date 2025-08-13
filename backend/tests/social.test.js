import express from 'express';
import { jest } from '@jest/globals';
import request from 'supertest';

await jest.unstable_mockModule('axios', () => ({
  default: { post: jest.fn() },
}));

await jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    socialAccount: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn(),
    },
  },
}));

const axios = (await import('axios')).default;
const socialRoutes = (await import('../src/routes/social.js')).default;
const prisma = (await import('../src/config/db.js')).default;

process.env.TWITTER_CLIENT_ID = 'id';
process.env.TWITTER_CLIENT_SECRET = 'secret';
process.env.TWITTER_REDIRECT_URI = 'https://callback';

const app = express();
app.use('/api/social', socialRoutes);

describe('Social OAuth flows', () => {
  it('generates authorization URL', async () => {
    const res = await request(app).get('/api/social/twitter/oauth');
    expect(res.status).toBe(200);
    expect(res.body.url).toContain('https://twitter.com/i/oauth2/authorize');
  });

  it('handles OAuth callback', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'a', refresh_token: 'b' } });
    const res = await request(app)
      .get('/api/social/twitter/callback')
      .query({ code: 'code', userId: '1' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(prisma.socialAccount.create).toHaveBeenCalled();
  });
});
