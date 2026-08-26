import redisClient from "../../../library/redis.js";

// Optimized clearUserCache implementation
export const clearUserCache = async () => {
    const keys: string[] = [];

    for await (const key of redisClient.scanIterator({
        MATCH: "user:*",
        COUNT: 100
    })) {
        keys.push(String(key));
    }

    if (keys.length > 0) {
        await redisClient.del(keys); // Deletes all matching keys at once
    }

    console.log(`User Redis cache cleared: ${keys.length} keys`);
};
