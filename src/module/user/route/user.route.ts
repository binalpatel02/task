import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { loginController, createUserController, getUsersController, getUserByIdController, updateUserController, deleteUserController, logoutController } from "../controller/user.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { userAuthenticate } from "../../../middleware/auth.middleware.js";

const router = Router();

const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string; // Force cast to a single string parameter

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Malformatted or invalid user ID format." 
        });
    }
    next();
};

router.post("/users/login", loginController);
router.post("/users/logout",userAuthenticate, logoutController); 

router.post("/users", upload.single("avatar"), createUserController);

router.use(userAuthenticate);

router.get("/users", getUsersController);

router.get("/users/:id", validateObjectId, getUserByIdController);
router.put("/users/:id", validateObjectId, upload.single("avatar"), updateUserController);
router.delete("/users/:id", validateObjectId, deleteUserController);

export default router;
