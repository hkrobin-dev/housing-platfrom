import { Router } from "express";
import * as controller from "./utilityBill.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createUtilityBillSchema } from "./utilityBill.validation";

const router = Router();

router.post("/", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(createUtilityBillSchema), controller.createBill);
router.get("/property/:propertyId", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), controller.listBillsForProperty);
router.get("/my-splits", authenticate, authorize("TENANT"), controller.listMySplits);
router.post("/splits/:id/pay", authenticate, authorize("TENANT"), controller.paySplit);

export default router;
