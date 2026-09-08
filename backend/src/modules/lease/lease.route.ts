import { Router } from "express";
import * as controller from "./lease.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/my", authenticate, authorize("TENANT"), controller.listMyLeases);
router.get("/property/:propertyId", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listLeasesForProperty);
router.get("/:id", authenticate, controller.getLease);
router.patch("/:id/terminate", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.terminateLease);

export default router;
