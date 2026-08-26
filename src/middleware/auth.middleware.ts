import type { NextFunction, Request, Response } from "express";
import passport from "passport";

export const userAuthenticate = ( req: Request, res: Response, next: NextFunction ) => {

    return passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
        if (err) {
          return next(err); // Server error occurred
        }

        if (!user) {
          // why validation failed (e.g., "jwt expired" or "No auth token")
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