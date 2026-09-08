import { Router } from "express";
import * as controller from "./maintenance.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createMaintenanceSchema, updateMaintenanceStatusSchema } from "./maintenance.validation";

const router = Router();

router.post("/", authenticate, authorize("TENANT"), validate(createMaintenanceSchema), controller.createRequest);
router.get("/my", authenticate, controller.listMyRequests);
router.get("/property/:propertyId", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listPropertyRequests);
router.patch("/:id/status", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(updateMaintenanceStatusSchema), controller.updateStatus);

export default router;
