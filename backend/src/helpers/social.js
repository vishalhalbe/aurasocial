import axios from 'axios';
import prisma from '../config/db.js';

// Configuration for each supported platform
const platformConfig = {
  twitter: {
    postUrl: 'https://api.twitter.com/2/tweets',
    refreshUrl: 'https://api.twitter.com/2/oauth2/token',
    refreshParams: (account) =>
      new URLSearchParams({
        client_id: process.env.TWITTER_CLIENT_ID,
        client_secret: process.env.TWITTER_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
      }),
    postParams: (content) => ({ text: content }),
  },
  facebook: {
    postUrl: 'https://graph.facebook.com/v17.0/me/feed',
    refreshUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    refreshParams: (account) => ({
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      fb_exchange_token: account.accessToken,
    }),
    postParams: (content, mediaUrl) => ({ message: content, link: mediaUrl }),
  },
  instagram: {
    postUrl: 'https://graph.facebook.com/v17.0/instagram_oauth/media',
    refreshUrl: 'https://graph.instagram.com/refresh_access_token',
    refreshParams: (account) => ({
      grant_type: 'ig_refresh_token',
      access_token: account.accessToken,
    }),
    postParams: (content, mediaUrl) => ({ caption: content, image_url: mediaUrl }),
  },
};

/**
 * Refresh an access token if a refresh token is available.
 * Returns the fresh access token and persists it to the database.
 */
export async function refreshToken(account) {
  const config = platformConfig[account.platform];
  if (!config || !config.refreshUrl || !account.refreshToken) {
    return account.accessToken;
  }

  try {
    const params = config.refreshParams(account);
    const method = params instanceof URLSearchParams ? 'post' : 'get';
    const response =
      method === 'post'
        ? await axios.post(config.refreshUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
        : await axios.get(config.refreshUrl, { params });
    const { access_token, refresh_token } = response.data;
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        accessToken: access_token || account.accessToken,
        refreshToken: refresh_token || account.refreshToken,
      },
    });
    return access_token || account.accessToken;
  } catch (err) {
    console.error('Token refresh failed', err.response?.data || err.message);
    return account.accessToken;
  }
}

/**
 * Post content to a social platform using the provided account tokens.
 */
export async function postContent(account, content, mediaUrl) {
  const config = platformConfig[account.platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${account.platform}`);
  }

  const payload = config.postParams(content, mediaUrl);
  await axios.post(config.postUrl, payload, {
    headers: { Authorization: `Bearer ${account.accessToken}` },
  });
}

export default { refreshToken, postContent };
