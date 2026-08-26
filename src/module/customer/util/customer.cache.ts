import redisClient from "../../../library/redis.js";

export const clearCustomerCache = async () => {

    const keys: string[] = [];

    // Customer list/search cache
    for await (
        const key of redisClient.scanIterator({
            MATCH: "customers:*",
            COUNT: 100
        })
    ) {
        keys.push(String(key));
    }

    // Customer ID cache
    for await (
        const key of redisClient.scanIterator({
            MATCH: "customer:*",
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
        `Customer Redis cache cleared: ${keys.length} keys`
    );
};