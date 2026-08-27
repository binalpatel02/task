import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import redisClient from "../library/redis.js";

export const userAuthenticate = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        // Extract the Authorization Header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (token) {
            // Check if the token is blacklisted in Redis
            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                console.log("[AUTH ERROR]: Attempted use of blacklisted/revoked token.");
                return res.status(401).json({
                    status: "Unauthorized",
                    message: "This session has expired. Please log in again."
                });
            }
        }
    } catch (redisError) {
        console.error("[AUTH REDIS ERROR]:", redisError);
    }

    return passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
        if (err) {
            return next(err); // Server error occurred
        }

        if (!user) {
            console.log("[AUTH ERROR INFO]:", info?.message || "Invalid or missing token");
            
            return res.status(401).json({ 
                status: "Unauthorized", 
                message: info?.message || "You must provide a valid authentication token." 
            });
        }

        // Success: manually log the user in for this request context
        req.user = user;
        next();
    })(req, res, next);
};
