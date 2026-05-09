import { Request } from "express";
import { MaintenanceTaskModel } from "../models/maintenanceTask.model";
import { SafetyDrillModel } from "../models/safetyDrill.model";

const percent = (complete: number, total: number) =>
  total === 0 ? 100 : Math.round((complete / total) * 100);

export const ComplianceService = {
  async summary(req: Request) {
    const { ship } = req.query;
    const today = new Date();
    const maintenanceFilter: Record<string, any> = {};
    const drillFilter: Record<string, any> = {};
    if (ship) {
      maintenanceFilter.ship = ship;
      drillFilter.ship = ship;
    }

    const [
      totalMaintenance,
      completedMaintenance,
      pendingMaintenance,
      overdueMaintenance,
      totalDrills,
      completedDrills,
      missedDrills,
      recentMaintenance,
      upcomingDrills,
    ] = await Promise.all([
      MaintenanceTaskModel.countDocuments(maintenanceFilter),
      MaintenanceTaskModel.countDocuments({ ...maintenanceFilter, status: "completed" }),
      MaintenanceTaskModel.countDocuments({ ...maintenanceFilter, status: { $ne: "completed" } }),
      MaintenanceTaskModel.countDocuments({
        ...maintenanceFilter,
        status: { $ne: "completed" },
        dueDate: { $lt: today },
      }),
      SafetyDrillModel.countDocuments(drillFilter),
      SafetyDrillModel.countDocuments({ ...drillFilter, status: "completed" }),
      SafetyDrillModel.countDocuments({
        ...drillFilter,
        status: { $ne: "completed" },
        scheduledDate: { $lt: today },
      }),
      MaintenanceTaskModel.find(maintenanceFilter)
        .populate("ship", "name imoNumber")
        .populate("assignedTo", "firstName lastName email")
        .sort({ dueDate: 1 })
        .limit(6),
      SafetyDrillModel.find(drillFilter)
        .populate("ship", "name imoNumber")
        .sort({ scheduledDate: 1 })
        .limit(6),
    ]);

    const maintenanceCompliance = percent(completedMaintenance, totalMaintenance);
    const drillCompliance = percent(completedDrills, totalDrills);
    const overallCompliance = Math.round((maintenanceCompliance + drillCompliance) / 2);

    return {
      totals: {
        maintenance: totalMaintenance,
        drills: totalDrills,
        pendingMaintenance,
        overdueMaintenance,
        completedMaintenance,
        completedDrills,
        missedDrills,
      },
      compliance: {
        maintenance: maintenanceCompliance,
        drills: drillCompliance,
        overall: overallCompliance,
      },
      risks: {
        overdueMaintenance,
        missedDrills,
        status:
          overdueMaintenance > 0 || missedDrills > 0
            ? "atRisk"
            : overallCompliance >= 85
            ? "compliant"
            : "watch",
      },
      recentMaintenance,
      upcomingDrills,
    };
  },
};
