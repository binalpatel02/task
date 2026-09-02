import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectionRedis } from "./library/redis.js";
import { startUserConsumer } from "./module/user/library/rabbitmq/user.consumer.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);

        console.log( `MongoDB connected: ${process.env.INSTANCE}`);

        await connectionRedis();

        await startUserConsumer();

        app.listen(PORT, () => {
            console.log(`${process.env.INSTANCE} running on port ${PORT}`);
        });
    }
    
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
