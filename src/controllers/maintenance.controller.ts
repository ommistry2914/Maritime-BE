import { controllerHandler } from "../utils/controllerHandler";
import { MaintenanceService } from "../services/maintenance.service";

export const listMaintenanceTasks = controllerHandler(
  async (req) => MaintenanceService.list(req),
  { message: "Maintenance tasks fetched successfully" }
);

export const createMaintenanceTask = controllerHandler(
  async (req) => MaintenanceService.create(req),
  { statusCode: 201, message: "Maintenance task created successfully" }
);

export const updateMaintenanceTask = controllerHandler(
  async (req) => MaintenanceService.update(req),
  { message: "Maintenance task updated successfully" }
);

export const updateMaintenanceStatus = controllerHandler(
  async (req) => MaintenanceService.updateStatus(req),
  { message: "Maintenance status updated successfully" }
);

export const addMaintenanceComment = controllerHandler(
  async (req) => MaintenanceService.addComment(req),
  { message: "Maintenance comment added successfully" }
);
