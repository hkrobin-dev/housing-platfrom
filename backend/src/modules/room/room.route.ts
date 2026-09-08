import { Router } from "express";
import * as controller from "./room.controller";
import { validate } from "../../middlewares/validate";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createRoomSchema, updateRoomSchema } from "./room.validation";

const router = Router({ mergeParams: true });

router.get("/", controller.listRooms);
router.get("/:id", controller.getRoom);
router.post("/", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(createRoomSchema), controller.createRoom);
router.patch("/:id", authenticate, authorize("OWNER", "MANAGER", "ADMIN"), validate(updateRoomSchema), controller.updateRoom);
router.delete("/:id", authenticate, authorize("OWNER", "ADMIN"), controller.deleteRoom);

export default router;
