import { Router } from "express";
import * as controller from "./payment.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/my", authenticate, controller.listMyPayments);
router.get("/by-tran/:tranId", authenticate, controller.getPaymentByTran);

// Public callback routes — SSLCommerz redirects/posts here directly (no auth header available)
router.all("/success", controller.paymentSuccess);
router.all("/fail", controller.paymentFail);
router.all("/cancel", controller.paymentCancel);
router.post("/ipn", controller.paymentIpn);

export default router;
