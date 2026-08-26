import { Router } from "express";
import { createCustomerController,  getCustomersController,  getCustomerByIdController,  updateCustomerController,  deleteCustomerController,  importCustomerController } from "../controller/customer.controller.js";
import { uploadCustomerExcel } from "../middleware/customer.upload.js";
import { userAuthenticate } from "../../../middleware/auth.middleware.js";
import { requirePermission } from "../../../middleware/access.middleware.js";

const router = Router();

router.use(userAuthenticate);

router.get("/customers", requirePermission("customer", "view"), getCustomersController);
router.get("/customers/:id", requirePermission("customer", "view"), getCustomerByIdController);
router.post("/customers", requirePermission("customer", "manage"), createCustomerController);
router.put("/customers/:id", requirePermission("customer", "manage"), updateCustomerController);
router.delete("/customers/:id", requirePermission("customer", "manage"), deleteCustomerController);
router.post( "/customers/import", requirePermission("customer", "manage"),  uploadCustomerExcel.single("file"),  importCustomerController);

export default router;
