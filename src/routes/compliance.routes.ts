import { Router } from "express";
import { getComplianceSummary } from "../controllers/compliance.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/summary", authorize("admin"), getComplianceSummary);

export default router;
