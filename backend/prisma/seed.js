import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@aurasocial.com',
      passwordHash,
      name: 'Demo User',
      onboardingComplete: false
    }
  });

  await prisma.scheduledPost.createMany({
    data: [
      {
        content: 'Demo Post 1',
        mediaUrl: null,
        scheduledFor: new Date(Date.now() + 86400000),
        platform: 'facebook',
        userId: user.id
      },
      {
        content: 'Demo Post 2',
        mediaUrl: null,
        scheduledFor: new Date(Date.now() + 172800000),
        platform: 'linkedin',
        userId: user.id
      }
    ]
  });

  console.log('✅ Demo data inserted');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
