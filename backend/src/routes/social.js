// Social platform OAuth routes
import { Router } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { setState, getState, deleteState } from '../config/stateStore.js';

const router = Router();

const oauthConfig = {
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read tweet.write users.read offline.access',
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUri: process.env.TWITTER_REDIRECT_URI,
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    scope: 'public_profile,pages_manage_posts,pages_read_engagement',
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI,
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scope: 'user_profile,user_media',
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
  },
};

// Step 1: generate authorization URL
router.get('/:platform/oauth', async (req, res) => {
  const { platform } = req.params;
  const config = oauthConfig[platform];
  if (!config) return res.status(400).json({ error: 'Unsupported platform' });

  const state = crypto.randomBytes(16).toString('hex');
  await setState(state, req.user.id, 300);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  res.json({ url: `${config.authUrl}?${params.toString()}` });
});

// Step 2: handle OAuth callback and persist tokens
router.get('/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query;
  const config = oauthConfig[platform];
  if (!config) return res.status(400).json({ error: 'Unsupported platform' });

  try {
    const storedUserId = await getState(state);
    if (!storedUserId || storedUserId !== String(req.user.id)) {
      return res.status(400).json({ error: 'Invalid state' });
    }
    await deleteState(state);
    const userId = req.user.id;

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
      code,
    });

    const tokenRes = await axios.post(config.tokenUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, refresh_token } = tokenRes.data;

    const existing = await prisma.socialAccount.findFirst({
      where: { userId: userId, platform },
    });

    if (existing) {
      await prisma.socialAccount.update({
        where: { id: existing.id },
        data: { accessToken: access_token, refreshToken: refresh_token },
      });
    } else {
      await prisma.socialAccount.create({
        data: {
          userId: userId,
          platform,
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('OAuth error', err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

export default router;
