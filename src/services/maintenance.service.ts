import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { MaintenanceTaskModel } from "../models/maintenanceTask.model";
import { ShipModel } from "../models/ship.model";
import { UserModel } from "../models/user.model";

const populateTask = [
  { path: "ship", select: "name imoNumber vesselType status" },
  { path: "assignedTo", select: "firstName lastName email role" },
  { path: "createdBy", select: "firstName lastName email" },
  { path: "comments.author", select: "firstName lastName email" },
];

const normalizeStatusDates = (body: any) => {
  if (body.status === "completed") body.completedAt = new Date();
  if (body.status && body.status !== "completed") body.completedAt = undefined;
  return body;
};

const isAssignedCrew = (role?: string) => ["crew", "user"].includes(role || "");

export const MaintenanceService = {
  async list(req: Request) {
    const { ship, status, assignedTo, from, to, mine } = req.query;
    const filter: Record<string, any> = {};
    if (req.user?.role === "superAdmin") throw new ApiError(403, "Forbidden");
    if (!["admin", "crew", "user"].includes(req.user?.role || "")) throw new ApiError(403, "Forbidden");
    if (ship) filter.ship = ship;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (isAssignedCrew(req.user?.role)) filter.assignedTo = req.user?.id;
    if (mine === "true" && req.user?.id) filter.assignedTo = req.user.id;
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(String(from));
      if (to) filter.dueDate.$lte = new Date(String(to));
    }

    return MaintenanceTaskModel.find(filter).populate(populateTask).sort({ dueDate: 1 });
  },

  async create(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const [ship, assignee] = await Promise.all([
      ShipModel.findById(req.body.ship),
      UserModel.findById(req.body.assignedTo),
    ]);
    if (!ship) throw new ApiError(400, "Selected ship does not exist");
    if (!assignee || !isAssignedCrew(assignee.role)) {
      throw new ApiError(400, "Maintenance tasks can only be assigned to crew members");
    }
    if (ship.status === "inactive") {
      throw new ApiError(400, "Cannot create maintenance tasks for an inactive ship");
    }

    const task = await MaintenanceTaskModel.create({
      ...req.body,
      dueDate: new Date(req.body.dueDate),
      createdBy: req.user.id,
    });
    return task.populate(populateTask);
  },

  async update(req: Request) {
    const update = normalizeStatusDates({
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    });
    const task = await MaintenanceTaskModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate(populateTask);
    if (!task) throw new ApiError(404, "Maintenance task not found");
    return task;
  },

  async updateStatus(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const task = await MaintenanceTaskModel.findById(req.params.id);
    if (!task) throw new ApiError(404, "Maintenance task not found");
    if (isAssignedCrew(req.user.role) && task.assignedTo.toString() !== req.user.id) {
      throw new ApiError(403, "You can only update tasks assigned to you");
    }
    if (task.status === "completed" && req.body.status !== "completed") {
      throw new ApiError(400, "Completed maintenance tasks cannot be reopened from the crew workflow");
    }
    if (["inProgress", "completed"].includes(req.body.status) && !req.body.note) {
      throw new ApiError(400, "A work note is required when updating maintenance status");
    }

    task.status = req.body.status;
    task.completedAt = req.body.status === "completed" ? new Date() : undefined;
    if (req.body.note) {
      task.comments.push({ author: req.user.id as any, note: req.body.note, createdAt: new Date() });
    }
    await task.save();
    return task.populate(populateTask);
  },

  async addComment(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const task = await MaintenanceTaskModel.findById(req.params.id);
    if (!task) throw new ApiError(404, "Maintenance task not found");
    if (isAssignedCrew(req.user.role) && task.assignedTo.toString() !== req.user.id) {
      throw new ApiError(403, "You can only comment on tasks assigned to you");
    }
    task.comments.push({ author: req.user.id as any, note: req.body.note, createdAt: new Date() });
    await task.save();
    return task.populate(populateTask);
  },
};
