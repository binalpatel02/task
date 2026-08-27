import redisClient from "../../../library/redis.js";

// Helper to generate consistent cache keys matching the service layer
const getUserCacheKey = (id: string) => `${id}`;

export const clearUserCache = async (id: string) => {
    if (!id) return;
    
    const cacheKey = getUserCacheKey(id);
    try {
        await redisClient.del(cacheKey);
        console.log(`[VERIFIED CLEANUP] Wiped profile cache key from memory: ${cacheKey}`);
    } catch (err) {
        console.error(`Redis explicitly clear error for key ${cacheKey}:`, err);
    }
};
