import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.js';

const app = express();
app.use('/api/auth', authRoutes);

describe('Authentication routes', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
