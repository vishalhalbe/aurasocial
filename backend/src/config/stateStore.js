import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('Redis error', err));
client.connect().catch((err) => {
  console.error('Redis connection failed, using in-memory store', err);
});

const memory = new Map();

export async function setState(key, value, ttl = 300) {
  if (client.isOpen) {
    await client.set(key, value, { EX: ttl });
  } else {
    memory.set(key, { value, expires: Date.now() + ttl * 1000 });
  }
}

export async function getState(key) {
  if (client.isOpen) {
    return await client.get(key);
  }
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

export async function deleteState(key) {
  if (client.isOpen) {
    await client.del(key);
  } else {
    memory.delete(key);
  }
}
