import { Router } from "express";
import * as controller from "./dashboard.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/owner", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.ownerDashboard);
router.get("/admin", authenticate, authorize("ADMIN"), controller.adminDashboard);

export default router;
