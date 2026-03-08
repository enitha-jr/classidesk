const { createClient } = require("redis");
const { REDIS } = require("../config/config");

const CHAT_KEY_PREFIX = "chat_history:";

let redisClient = null;
let isRedisReady = false;
let hasLoggedRedisError = false;

const buildRedisClient = () => {
  const options = REDIS.url
    ? { url: REDIS.url }
    : {
        socket: {
          host: REDIS.host,
          port: REDIS.port,
          connectTimeout: 3000,
          // Disable infinite reconnect loops when Redis is not running.
          reconnectStrategy: () => false,
        },
        password: REDIS.password || undefined,
      };

  return createClient(options);
};

const initRedis = async () => {
  try {
    redisClient = buildRedisClient();

    redisClient.on("ready", () => {
      isRedisReady = true;
      hasLoggedRedisError = false;
      console.log("Redis connected");
    });

    redisClient.on("error", (err) => {
      isRedisReady = false;
      if (!hasLoggedRedisError) {
        console.warn("Redis unavailable. Chat persistence disabled:", err.message);
        hasLoggedRedisError = true;
      }
    });

    await redisClient.connect();
  } catch (error) {
    isRedisReady = false;
    redisClient = null;
    if (!hasLoggedRedisError) {
      console.warn("Redis unavailable. Chat persistence disabled:", error.message);
      hasLoggedRedisError = true;
    }
  }
};

initRedis();

const getChatKey = (userId) => `${CHAT_KEY_PREFIX}${userId}`;

const getChatHistory = async (userId) => {
  if (!isRedisReady || !redisClient || !userId) {
    return [];
  }

  const raw = await redisClient.get(getChatKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveChatHistory = async (userId, messages, ttlSeconds) => {
  if (!isRedisReady || !redisClient || !userId || !Array.isArray(messages)) {
    return;
  }

  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    await clearChatHistory(userId);
    return;
  }

  await redisClient.setEx(getChatKey(userId), ttlSeconds, JSON.stringify(messages));
};

const clearChatHistory = async (userId) => {
  if (!isRedisReady || !redisClient || !userId) {
    return;
  }

  await redisClient.del(getChatKey(userId));
};

module.exports = {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
};
