import redisClient from "../../../library/redis.js";

export const clearUserCache = async () => {

    const keys: string[] = [];

    // User ID cache
    for await (
        const key of redisClient.scanIterator({
            MATCH: "user:*",
            COUNT: 100
        })
    ) {
        keys.push(String(key));
    }

    // Delete each key separately
    for (const key of keys) {
        await redisClient.del(key);
    }

    console.log(
        `User Redis cache cleared: ${keys.length} keys`
    );
};