import { Router } from "express";
import * as controller from "./rent.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { generateScheduleSchema } from "./rent.validation";

const router = Router();

router.post("/lease/:leaseId/generate", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(generateScheduleSchema), controller.generateSchedule);
router.get("/lease/:leaseId", authenticate, controller.listRentPayments);
router.post("/:id/pay", authenticate, authorize("TENANT"), controller.payRent);

export default router;
