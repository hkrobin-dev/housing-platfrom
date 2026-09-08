import { Router } from "express";
import * as controller from "./property.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createPropertySchema, updatePropertySchema } from "./property.validation";
import { assignManagerSchema } from "./manager.validation";
import { upload } from "../../config/multer";

const router = Router();

router.get("/my", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listMyProperties);
router.get("/", controller.listProperties); // public search
router.get("/:id", controller.getProperty); // public view

router.post("/", authenticate, authorize("OWNER", "ADMIN"), validate(createPropertySchema), controller.createProperty);
router.get("/:id/tenants", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.getActiveTenants);
router.patch("/:id/manager", authenticate, authorize("OWNER", "ADMIN"), validate(assignManagerSchema), controller.assignManager);
router.delete("/:id/manager", authenticate, authorize("OWNER", "ADMIN"), controller.removeManager);
router.patch("/:id", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(updatePropertySchema), controller.updateProperty);
router.delete("/:id", authenticate, authorize("OWNER", "ADMIN"), controller.deleteProperty);
router.post("/:id/images", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), upload.array("images", 10), controller.uploadPropertyImages);

export default router;
