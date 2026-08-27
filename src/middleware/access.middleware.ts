import type { NextFunction, Request, Response } from "express";
import { Role } from "../module/role/index.js";
import redisClient from "../library/redis.js"; 

export const requirePermission = (resource: string, action: "view" | "manage") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const activeUser = req.user as any;
        
        console.log('-------------------------------');
        console.log('Active User Object:', activeUser);

        if (!activeUser || !activeUser.user_type) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing."
            });
        }

        try {
            const userTypeVal = activeUser.user_type.toString().trim();
            const cacheKey = `role:permissions:${userTypeVal}`;
            
            let permissionsStructure: any = null;

            // fetch permissions from Redis Cache
            try {
                const cachedPermissions = await redisClient.get(cacheKey);
                if (cachedPermissions) {
                    console.log(`[PERMISSIONS CACHE HIT]: Found permissions for role: ${userTypeVal}`);
                    permissionsStructure = JSON.parse(cachedPermissions);
                }
            } catch (redisReadError) {
                console.error("[REDIS PERMISSION READ ERROR]:", redisReadError);
            }

            // Cache Miss: Fetch from MongoDB
            if (!permissionsStructure) {
                console.log(`[PERMISSIONS CACHE MISS]: Fetching from MongoDB for role: ${userTypeVal}`);
                const roleData = await Role.findOne({ title: userTypeVal }); 

                if (!roleData) {
                    return res.status(403).json({
                        success: false,
                        message: `Assigned role "${userTypeVal}" could not be found`
                    });
                }

                // Extract permissions map from database object
                permissionsStructure = (roleData as any)?.permission || {};

                // Save to Redis with a 1-hour expiration time (3600 seconds)
                try {
                    await redisClient.set(cacheKey, JSON.stringify(permissionsStructure), {
                        EX: 3600
                    });
                } catch (redisWriteError) {
                    console.error("[REDIS PERMISSION WRITE ERROR]:", redisWriteError);
                }
            }

            const resourcePermissions = permissionsStructure[resource] || {};
            const hasAccess = !!resourcePermissions[action];

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `Your role does not have permission to ${action} ${resource}s.`
                });
            }

            next();
        } 
        catch (error) {
            console.error("PERMISSION CHECK ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during permission check."
            });
        }
    };
};
