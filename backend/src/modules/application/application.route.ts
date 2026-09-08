import { Router } from "express";
import * as controller from "./application.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createApplicationSchema, reviewApplicationSchema } from "./application.validation";

const router = Router();

router.post("/", authenticate, authorize("TENANT"), validate(createApplicationSchema), controller.applyToRoom);
router.get("/my", authenticate, controller.listMyApplications);
router.get("/property/:propertyId", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listApplicationsForOwner);
router.patch("/:id/review", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(reviewApplicationSchema), controller.reviewApplication);

export default router;
