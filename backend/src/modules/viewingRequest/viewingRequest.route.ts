import { Router } from "express";
import * as controller from "./viewingRequest.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createViewingRequestSchema, updateViewingStatusSchema } from "./viewingRequest.validation";

const router = Router();

router.post("/", authenticate, authorize("TENANT"), validate(createViewingRequestSchema), controller.createViewingRequest);
router.get("/my", authenticate, controller.listMyViewingRequests);
router.get("/property/:propertyId", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listPropertyViewingRequests);
router.patch("/:id/status", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(updateViewingStatusSchema), controller.updateViewingStatus);

export default router;
