import { Router } from "express";
import * as controller from "./roommate.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { upsertRoommateProfileSchema } from "./roommate.validation";

const router = Router();

router.put("/profile", authenticate, validate(upsertRoommateProfileSchema), controller.upsertProfile);
router.get("/profile", authenticate, controller.getMyProfile);
router.get("/matches", authenticate, controller.getRoommateMatches);
router.get("/room-matches", authenticate, controller.getRoomMatches);

export default router;
