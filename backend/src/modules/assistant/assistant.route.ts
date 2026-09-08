import { Router } from "express";
import * as controller from "./assistant.controller";
import { validate } from "../../middlewares/validate";
import { chatSchema } from "./assistant.validation";

const router = Router();

// Public — no login required to chat with the assistant (browsing users too)
router.post("/chat", validate(chatSchema), controller.chat);

export default router;
