import { Router } from "express";
import { createShip, listShips, updateShip } from "../controllers/ship.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../validation/validate";
import { createShipSchema, updateShipSchema } from "../validation/operations.validate";

const router = Router();

router.use(authenticate);
router.get("/", authorize("admin"), listShips);
router.post("/", authorize("admin"), validate(createShipSchema), createShip);
router.patch("/:id", authorize("admin"), validate(updateShipSchema), updateShip);

export default router;
