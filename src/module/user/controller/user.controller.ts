import { Request, Response } from "express";
import { loginUserService, createUserService, getUsersService, getUserByIdService, updateUserService, deleteUserService } from "../service/user.service.js";
import { userSchema } from "../validation/user.validation.js";
import redisClient from "../../../library/redis.js"; 

// LOGIN
export const loginController = async ( req: Request, res: Response ) => {
    try {
        const { email_address, password } = req.body;

        if (!email_address || !password) {
            return res.status(400).json({
                success: false,
                message: "Email address and password are required"
            });
        }

        const result = await loginUserService( email_address, password );

        if (!result) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: result.user,
                token: result.token
            }
        });

    } catch (error: any) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

// LOGOUT - Revokes active authentication session tokens
export const logoutController = async ( req: Request, res: Response ) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Authentication token missing. Unable to log out."
            });
        }

        // Add the extracted token to the Redis blacklist
        // Set to 86400 seconds (24 hours) to match token's '1d' expiration lifetime
        await redisClient.set(`blacklist:${token}`, "true", { EX: 86400 });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully. Session has been revoked."
        });
    } catch (error) {
        console.error("LOGOUT CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred during logout."
        });
    }
};

// CREATE USER
export const createUserController = async ( req: Request, res: Response ) => {
    try {
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);

        if (req.file) {
            req.body.avatar = req.file.filename;
        }

        const { error } = userSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const user = await createUserService(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error: any) {
        console.error("CREATE USER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
};

// GET USERS
export const getUsersController = async ( req: Request, res: Response ) => {
    try {
        const name = typeof req.query.name === "string" ? req.query.name : "";
        const email = typeof req.query.email === "string" ? req.query.email : "";
        const mobileNumber = typeof req.query.mobileNumber === "string" ? req.query.mobileNumber : "";

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 10);

        const result = await getUsersService(name, email, mobileNumber, page, limit);

        if (result.total === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET USERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get users"
        });
    }
};

// GET USER BY ID
export const getUserByIdController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id as string);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });

    } catch (error: any) {
        console.error("GET USER BY ID ERROR:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};

// UPDATE USER
export const updateUserController = async ( req: Request, res: Response ) => {
    try {
        const { error } = userSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const user = await updateUserService(req.params.id as string, req.body);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error: any) {
        console.error("UPDATE USER ERROR:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            let message = "Duplicate value already exists";

            if (duplicateField === "emailAddress") {
                message = "Email address already exists";
            }
            if (duplicateField === "mobileNumber") {
                message = "number already exists";
            }

            return res.status(409).json({
                success: false,
                message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    }
};

// DELETE USER
export const deleteUserController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const user = await deleteUserService(id as string);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user
        });

    } catch (error: any) {
        console.error("DELETE USER ERROR:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};
