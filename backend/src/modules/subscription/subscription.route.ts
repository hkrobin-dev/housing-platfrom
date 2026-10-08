import { Router } from "express";
import * as controller from "./subscription.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate";
import { checkoutSchema } from "./subscription.validation";

const router = Router();

router.post("/checkout", authenticate, validate(checkoutSchema), controller.checkout);
router.get("/my", authenticate, controller.mySubscription);

// Admin: see who requested/paid for plans + manually approve edge cases
// (normal path auto-activates on verified payment — no manual step needed).
router.get("/", authenticate, authorize("ADMIN"), controller.listAllSubscriptions);
router.patch("/:id/approve", authenticate, authorize("ADMIN"), controller.approveSubscription);

export default router;
