import { Router } from "express";
import customersRoutes  from "../../module/customer/route/customer.route.js";
import userRoutes from "../../module/user/route/user.route.js";
import roleRoutes from "../../module/role/route/role.route.js";

const router = Router();

router.use(userRoutes);
router.use(customersRoutes);
router.use(roleRoutes);

export default router;