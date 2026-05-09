import { Router } from "express";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import shipRoutes from "./ship.routes";
import maintenanceRoutes from "./maintenance.routes";
import drillRoutes from "./drill.routes";
import complianceRoutes from "./compliance.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admins", adminRoutes);
router.use("/ships", shipRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/drills", drillRoutes);
router.use("/compliance", complianceRoutes);

export default router;
