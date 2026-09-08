import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { sendSuccess } from "./utils/apiResponse";
import rateLimit from "express-rate-limit";

import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import propertyRoutes from "./modules/property/property.route";
import roomRoutes from "./modules/room/room.route";
import roommateRoutes from "./modules/roommate/roommate.route";
import viewingRequestRoutes from "./modules/viewingRequest/viewingRequest.route";
import applicationRoutes from "./modules/application/application.route";
import leaseRoutes from "./modules/lease/lease.route";
import rentRoutes from "./modules/rent/rent.route";
import utilityBillRoutes from "./modules/utilityBill/utilityBill.route";
import maintenanceRoutes from "./modules/maintenance/maintenance.route";
import documentRoutes from "./modules/document/document.route";
import notificationRoutes from "./modules/notification/notification.route";
import paymentRoutes from "./modules/payment/payment.route";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import assistantRoutes from "./modules/assistant/assistant.route";

const app: Application = express();

// --- Global Middlewares ---
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Generous global limiter as defense-in-depth (tighter, route-specific limiters
// live on sensitive endpoints like /auth — see rateLimit.middleware.ts)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Health check ---
app.get("/", (_req: Request, res: Response) => {
  return sendSuccess(res, { message: "Housing & Roommate Management Platform API is running" });
});

// --- API Routes (v1) ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/properties/:propertyId/rooms", roomRoutes); // nested: list/create rooms under a property
app.use("/api/v1/rooms", roomRoutes); // standalone: get/update/delete a room by id
app.use("/api/v1/roommates", roommateRoutes);
app.use("/api/v1/viewing-requests", viewingRequestRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/leases", leaseRoutes);
app.use("/api/v1/rent-payments", rentRoutes);
app.use("/api/v1/utility-bills", utilityBillRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/assistant", assistantRoutes);

// --- 404 + Global Error Handler (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
