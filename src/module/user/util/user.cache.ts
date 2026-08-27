import redisClient from "../../../library/redis.js";

export const clearUserCache = async () => {
    const keys: string[] = [];

    for await (const batch of redisClient.scanIterator({
        MATCH: "user:list:*", 
        COUNT: 100
    })) {
        keys.push(...(batch as unknown as string[]));
    }

    if (keys.length > 0) {
        await redisClient.del(keys); 
    }

    console.log(`[VERIFIED CLEANUP] User Redis LIST caches wiped: ${keys.length} keys`);
};
