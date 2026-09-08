import { Router } from "express";
import * as controller from "./document.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

router.post("/", authenticate, upload.single("file"), controller.uploadDocument);
router.get("/my", authenticate, controller.listMyDocuments);
router.get("/:id", authenticate, controller.getDocument);
router.delete("/:id", authenticate, controller.deleteDocument);

export default router;
