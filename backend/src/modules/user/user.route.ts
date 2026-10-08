import { Router } from "express";
import * as userController from "./user.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate";
import { setBanStatusSchema, updateUserRoleSchema, updateMyProfileSchema } from "./user.validation";

const router = Router();

router.get("/me/profile", authenticate, userController.getProfile);
router.patch("/me", authenticate, validate(updateMyProfileSchema), userController.updateMyProfile);

// Admin-only endpoints — demonstrates RBAC via authorize()
router.get("/", authenticate, authorize("ADMIN"), userController.listUsers);
router.patch("/:id/ban", authenticate, authorize("ADMIN"), validate(setBanStatusSchema), userController.setBanStatus);
router.patch("/:id/verify", authenticate, authorize("ADMIN"), userController.verifyUser);
router.patch("/:id/role", authenticate, authorize("ADMIN"), validate(updateUserRoleSchema), userController.updateUserRole);

export default router;
