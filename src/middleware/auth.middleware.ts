import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import redisClient from "../library/redis.js";
import { User } from "../module/user/index.js";

const CACHE_TTL = 300; 
const getUserCacheKey = (id: string) => `${id}`;

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

    return passport.authenticate("jwt", { session: false }, async (err: any, passportUser: any, info: any) => {
        if (err) {
            return next(err); // Server error occurred
        }

        if (!passportUser) {
            console.log("[AUTH ERROR INFO]:", info?.message || "Invalid or missing token");
            return res.status(401).json({ 
                status: "Unauthorized", 
                message: info?.message || "You must provide a valid authentication token." 
            });
        }

        const userId = passportUser._id.toString();
        const cacheKey = getUserCacheKey(userId);
        let finalUser = null;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log(`[AUTH REDIS HIT]: Loading user data from Redis for ID: ${userId}`);
                finalUser = JSON.parse(cachedData);
            }
        } catch (cacheErr) {
            console.error("[AUTH REDIS READ ERROR]:", cacheErr);
        }

        if (!finalUser) {
            console.log(`[AUTH REDIS MISS]: Fetching fresh user data from MongoDB for ID: ${userId}`);
            
            try {
                finalUser = await User.findById(userId).lean();
                
                if (!finalUser) {
                    return res.status(401).json({
                        status: "Unauthorized",
                        message: "User account no longer exists."
                    });
                }

                await redisClient.set(cacheKey, JSON.stringify(finalUser), { EX: CACHE_TTL });
                console.log(`[AUTH REDIS SUCCESS]: Saved missing user structure back to Redis cache`);
            } catch (dbErr) {
                console.error("[AUTH DB ERROR]:", dbErr);
                finalUser = passportUser;
            }
        }

        req.user = finalUser;
        next();
    })(req, res, next);
};
