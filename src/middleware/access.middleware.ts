import type { NextFunction, Request, Response } from "express";
import { Role } from "../module/role/index.js";

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
            let roleData = null;

            roleData = await Role.findOne({ title: userTypeVal }); 

            if (!roleData) {
                return res.status(403).json({
                    success: false,
                    message: `Assigned role "${userTypeVal}" could not be found`
                });
            }

            const resourcePermissions = (roleData as any)?.permission?.[resource] || {};
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
