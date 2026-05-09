import { Router } from "express";
import {
  createSafetyDrill,
  listSafetyDrills,
  markDrillParticipation,
  updateSafetyDrill,
} from "../controllers/drill.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../validation/validate";
import {
  createSafetyDrillSchema,
  markDrillSchema,
  updateSafetyDrillSchema,
} from "../validation/operations.validate";

const router = Router();

router.use(authenticate);
router.get("/", listSafetyDrills);
router.post("/", authorize("admin"), validate(createSafetyDrillSchema), createSafetyDrill);
router.patch("/:id", authorize("admin"), validate(updateSafetyDrillSchema), updateSafetyDrill);
router.patch("/:id/participation", validate(markDrillSchema), markDrillParticipation);

export default router;
