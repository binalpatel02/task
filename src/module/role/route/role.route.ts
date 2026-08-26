import { Router } from "express";
import { createRoleController, getRoleByIdController, getRolesController, updateRoleController, deleteRoleController } from "../controller/role.controller.js";
import { userAuthenticate } from "../../../middleware/auth.middleware.js";

const router = Router();

router.use(userAuthenticate);
router.get("/roles", getRolesController);
router.get("/roles/:id", getRoleByIdController);
router.post("/roles",createRoleController);
router.put("/roles/:id", updateRoleController);
router.delete("/roles/:id", deleteRoleController);

export default router;