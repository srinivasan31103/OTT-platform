import { getRedisClient } from '../config/redis.js';

export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    keyPrefix = 'ratelimit'
  } = options;

  return async (req, res, next) => {
    const redisClient = getRedisClient();

    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      const identifier = req.user ? req.user._id.toString() : req.ip;
      const key = `${keyPrefix}:${identifier}`;

      const current = await redisClient.get(key);
      const requests = current ? parseInt(current) : 0;

      if (requests >= maxRequests) {
        const ttl = await redisClient.ttl(key);

        return res.status(429).json({
          success: false,
          message,
          retryAfter: ttl > 0 ? ttl : Math.ceil(windowMs / 1000)
        });
      }

      const pipeline = redisClient.multi();
      pipeline.incr(key);

      if (!current) {
        pipeline.expire(key, Math.ceil(windowMs / 1000));
      }

      await pipeline.exec();

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requests - 1));

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

export const createRateLimiters = () => {
  return {
    strict: rateLimiter({
      windowMs: 60000,
      maxRequests: 10,
      message: 'Too many requests from this IP, please try again after a minute',
      keyPrefix: 'ratelimit:strict'
    }),

    moderate: rateLimiter({
      windowMs: 60000,
      maxRequests: 60,
      message: 'Rate limit exceeded, please slow down',
      keyPrefix: 'ratelimit:moderate'
    }),

    lenient: rateLimiter({
      windowMs: 60000,
      maxRequests: 200,
      message: 'Too many requests, please try again later',
      keyPrefix: 'ratelimit:lenient'
    }),

    auth: rateLimiter({
      windowMs: 900000,
      maxRequests: 5,
      message: 'Too many authentication attempts, please try again later',
      keyPrefix: 'ratelimit:auth'
    }),

    upload: rateLimiter({
      windowMs: 3600000,
      maxRequests: 20,
      message: 'Upload limit reached, please try again later',
      keyPrefix: 'ratelimit:upload'
    })
  };
};

export const apiLimiter = rateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: 'API rate limit exceeded'
});

export const authLimiter = rateLimiter({
  windowMs: 60000, // 1 minute (changed from 15 minutes for easier testing)
  maxRequests: 20, // 20 attempts per minute (changed from 5 for testing)
  message: 'Too many authentication attempts, please try again later',
  keyPrefix: 'ratelimit:auth'
});

export const uploadLimiter = rateLimiter({
  windowMs: 3600000,
  maxRequests: 20,
  message: 'Upload limit reached, please try again later',
  keyPrefix: 'ratelimit:upload'
});
