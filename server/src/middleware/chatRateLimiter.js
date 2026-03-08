const userRequestStore = new Map();

const WINDOW_MS = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60 * 1000);
const MAX_REQUESTS = Number(process.env.CHAT_RATE_LIMIT_MAX || 10);

const cleanupExpiredEntries = (now) => {
  for (const [key, entry] of userRequestStore.entries()) {
    if (now > entry.resetAt) {
      userRequestStore.delete(key);
    }
  }
};

const chatRateLimiter = (req, res, next) => {
  const now = Date.now();
  const userId = req.user?.user_id || req.ip;

  // Keep in-memory store bounded by dropping expired records on each request.
  cleanupExpiredEntries(now);

  const currentEntry = userRequestStore.get(userId);

  if (!currentEntry || now > currentEntry.resetAt) {
    userRequestStore.set(userId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return next();
  }

  if (currentEntry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((currentEntry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));

    return res.status(429).json({
      message: `Too many chat requests. Please try again in ${retryAfterSeconds} seconds.`,
    });
  }

  currentEntry.count += 1;
  userRequestStore.set(userId, currentEntry);

  return next();
};

module.exports = {
  chatRateLimiter,
};
