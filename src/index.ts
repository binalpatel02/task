import "dotenv/config";
import "./library/passport.js"; 
import { connectionRedis } from "./library/redis.js";
import { startCustomerSyncConsumer } from "./module/customer/rabbitmq/consumer.js";

import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/customer-master';

const startServer = async () => {
  try {
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

    await connectionRedis();
    console.log("Redis connected");

    await startCustomerSyncConsumer();
    console.log("RabbitMQ Consumers initialized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
  
  catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
