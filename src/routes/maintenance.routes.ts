import { Router } from "express";
import {
  addMaintenanceComment,
  createMaintenanceTask,
  listMaintenanceTasks,
  updateMaintenanceStatus,
  updateMaintenanceTask,
} from "../controllers/maintenance.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../validation/validate";
import {
  addCommentSchema,
  createMaintenanceTaskSchema,
  updateMaintenanceTaskSchema,
  updateTaskStatusSchema,
} from "../validation/operations.validate";

const router = Router();

router.use(authenticate);
router.get("/", listMaintenanceTasks);
router.post("/", authorize("admin"), validate(createMaintenanceTaskSchema), createMaintenanceTask);
router.patch("/:id", authorize("admin"), validate(updateMaintenanceTaskSchema), updateMaintenanceTask);
router.patch("/:id/status", validate(updateTaskStatusSchema), updateMaintenanceStatus);
router.post("/:id/comments", validate(addCommentSchema), addMaintenanceComment);

export default router;
