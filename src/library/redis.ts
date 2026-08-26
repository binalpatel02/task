import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
    console.log("Redis Error", error);
});

redisClient.on("connect", () => {
    console.log("Redis connectting...");
});

redisClient.on("Ready", () => {
    console.log("Redis ready");
});

export const connectionRedis = async () => {
    if(!redisClient.isOpen) {
        await redisClient.connect();
    }
};

export default redisClient;