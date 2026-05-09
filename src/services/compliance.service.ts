import { Request } from "express";
import { MaintenanceTaskModel } from "../models/maintenanceTask.model";
import { SafetyDrillModel } from "../models/safetyDrill.model";

const percent = (complete: number, total: number) =>
  total === 0 ? 100 : Math.round((complete / total) * 100);

export const ComplianceService = {
  async summary(req: Request) {
    const { ship, from, to } = req.query;
    const today = new Date();
    const maintenanceFilter: Record<string, any> = {};
    const drillFilter: Record<string, any> = {};
    if (ship) {
      maintenanceFilter.ship = ship;
      drillFilter.ship = ship;
    }
    if (from || to) {
      maintenanceFilter.dueDate = {};
      drillFilter.scheduledDate = {};
      if (from) {
        maintenanceFilter.dueDate.$gte = new Date(String(from));
        drillFilter.scheduledDate.$gte = new Date(String(from));
      }
      if (to) {
        maintenanceFilter.dueDate.$lte = new Date(String(to));
        drillFilter.scheduledDate.$lte = new Date(String(to));
      }
    }

    const [
      totalMaintenance,
      completedMaintenance,
      pendingMaintenance,
      overdueMaintenance,
      lateCompletedMaintenance,
      totalDrills,
      totalDrillAssignments,
      completedDrillAssignments,
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
      MaintenanceTaskModel.countDocuments({
        ...maintenanceFilter,
        status: "completed",
        $expr: { $gt: ["$completedAt", "$dueDate"] },
      }),
      SafetyDrillModel.countDocuments(drillFilter),
      SafetyDrillModel.aggregate([
        { $match: drillFilter },
        { $unwind: "$participants" },
        { $count: "count" },
      ]),
      SafetyDrillModel.aggregate([
        { $match: drillFilter },
        { $unwind: "$participants" },
        { $match: { "participants.completed": true } },
        { $count: "count" },
      ]),
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
    const drillAssignmentTotal = totalDrillAssignments[0]?.count || 0;
    const drillAssignmentCompleted = completedDrillAssignments[0]?.count || 0;
    const drillCompliance = percent(drillAssignmentCompleted, drillAssignmentTotal);
    const overallCompliance = Math.round((maintenanceCompliance + drillCompliance) / 2);

    return {
      totals: {
        maintenance: totalMaintenance,
        drills: totalDrills,
        pendingMaintenance,
        overdueMaintenance,
        lateCompletedMaintenance,
        completedMaintenance,
        completedDrills: drillAssignmentCompleted,
        missedDrills,
      },
      compliance: {
        maintenance: maintenanceCompliance,
        drills: drillCompliance,
        overall: overallCompliance,
      },
      risks: {
        overdueMaintenance,
        lateCompletedMaintenance,
        missedDrills,
        status:
          overdueMaintenance > 0 || missedDrills > 0 || lateCompletedMaintenance > 0
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
