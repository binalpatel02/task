import express from "express";
import apiV1 from "./api/v1/index.js";
import passport from "./library/passport.js";

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Customer Master API is healthy"
    });
});

app.use("/api/v1", apiV1);

export default app;
