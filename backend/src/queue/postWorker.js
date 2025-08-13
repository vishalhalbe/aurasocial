import { Queue, Worker } from 'bullmq';
import prisma from '../config/db.js';
import { refreshToken, postContent } from '../helpers/social.js';

const connection = {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};

export const postQueue = new Queue('postQueue', connection);

export const postWorker = new Worker(
  'postQueue',
  async (job) => {
    const { postId } = job.data;
    const post = await prisma.scheduledPost.findUnique({ where: { id: postId } });
    if (!post || post.posted) return;

    const account = await prisma.socialAccount.findFirst({
      where: { userId: post.userId, platform: post.platform },
    });
    if (!account) throw new Error('No social account connected');

    const accessToken = await refreshToken(account);
    await postContent({ ...account, accessToken }, post.content, post.mediaUrl);

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { posted: true },
    });
  },
  connection
);
