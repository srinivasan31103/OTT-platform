import { createClient } from 'redis';

let redisClient;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  // Skip Redis if not configured or explicitly disabled
  if (!redisUrl || redisUrl === 'skip' || redisUrl === 'none') {
    console.log('ℹ️  Redis disabled - running without caching');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('❌ Redis max retries reached');
            return new Error('Redis max retries reached');
          }
          return retries * 100;
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('reconnecting', () => {
      console.log('⏳ Redis Reconnecting...');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('ℹ️  Continuing without Redis caching');
    return null;
  }
};

const getRedisClient = () => redisClient;

const setCache = async (key, value, expiry = 3600) => {
  if (!redisClient?.isOpen) return false;
  try {
    await redisClient.setEx(key, expiry, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis setCache error:', error);
    return false;
  }
};

const getCache = async (key) => {
  if (!redisClient?.isOpen) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!redisClient?.isOpen) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis deleteCache error:', error);
    return false;
  }
};

const clearCachePattern = async (pattern) => {
  if (!redisClient?.isOpen) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis clearCachePattern error:', error);
    return false;
  }
};

export { connectRedis, getRedisClient, setCache, getCache, deleteCache, clearCachePattern };
