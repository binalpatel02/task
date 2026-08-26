import { Router } from "express";
import { loginController, createUserController, getUsersController, getUserByIdController, updateUserController, deleteUserController } from "../controller/user.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { userAuthenticate } from "../../../middleware/auth.middleware.js";

const router = Router();

router.post("/users/login", loginController);
router.post("/users", upload.single("avatar"), createUserController);

router.use(userAuthenticate);
router.get("/users", getUsersController);
router.get("/users/:id", getUserByIdController);
router.put("/users/:id", upload.single("avatar"), updateUserController);
router.delete("/users/:id", deleteUserController);

export default router;