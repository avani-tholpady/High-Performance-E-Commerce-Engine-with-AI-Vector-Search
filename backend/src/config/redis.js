const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 3600; // default 1 hour (3600 seconds)

let redisClient = null;
let isRedisConnected = false;

// Do not connect to Redis during test execution to prevent blocking test runner
if (process.env.NODE_ENV !== "test") {
  redisClient = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.warn("⚠️ Redis reconnect retries exceeded. Running application without cache.");
          isRedisConnected = false;
          return new Error("Redis reconnect failed");
        }
        return Math.min(retries * 500, 2000);
      }
    }
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
    isRedisConnected = false;
  });

  redisClient.on("connect", () => {
    console.log("🔌 Connecting to Redis...");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis client is ready");
    isRedisConnected = true;
  });

  redisClient.on("end", () => {
    console.warn("⚠️ Redis connection closed");
    isRedisConnected = false;
  });

  // Connect immediately (non-blocking)
  redisClient.connect().catch((err) => {
    console.error("❌ Failed to connect to Redis on startup. Running without cache.", err.message);
    isRedisConnected = false;
  });
}

/**
 * Reads from Redis cache and parses JSON.
 * @param {string} key Cache key
 * @returns {any|null} Cached object or null
 */
const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error reading from Redis cache (key: ${key}):`, err.message);
    return null;
  }
};

/**
 * Writes object to Redis cache as JSON string with TTL expiration.
 * @param {string} key Cache key
 * @param {any} value Object to cache
 * @param {number} ttl Expiration time in seconds
 */
const setCache = async (key, value, ttl = CACHE_TTL) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl
    });
  } catch (err) {
    console.error(`Error writing to Redis cache (key: ${key}):`, err.message);
  }
};

/**
 * Deletes key or wildcard pattern from Redis cache.
 * @param {string} keyPattern Key string or wildcard pattern ending in '*'
 */
const deleteCache = async (keyPattern) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    if (keyPattern.endsWith("*")) {
      let cursor = 0;
      do {
        const reply = await redisClient.scan(cursor, {
          MATCH: keyPattern,
          COUNT: 100
        });
        cursor = Number(reply.cursor);
        const keys = reply.keys;
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } while (cursor !== 0);
    } else {
      await redisClient.del(keyPattern);
    }
  } catch (err) {
    console.error(`Error clearing Redis cache (pattern: ${keyPattern}):`, err.message);
  }
};

module.exports = {
  redisClient,
  isRedisConnected: () => isRedisConnected,
  getCache,
  setCache,
  deleteCache,
  CACHE_TTL
};
