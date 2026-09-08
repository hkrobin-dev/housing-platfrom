import { Router } from "express";
import * as controller from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, controller.listMyNotifications);
router.patch("/:id/read", authenticate, controller.markAsRead);
router.patch("/read-all", authenticate, controller.markAllAsRead);

export default router;
