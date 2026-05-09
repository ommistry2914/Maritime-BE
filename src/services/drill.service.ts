import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { SafetyDrillModel } from "../models/safetyDrill.model";
import { ShipModel } from "../models/ship.model";
import { UserModel } from "../models/user.model";

const populateDrill = [
  { path: "ship", select: "name imoNumber vesselType status" },
  { path: "participants.crew", select: "firstName lastName email role" },
  { path: "createdBy", select: "firstName lastName email" },
];

const participantsFromIds = (ids: string[] = []) =>
  [...new Set(ids)].map((crew) => ({ crew, attended: false, completed: false }));

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const DrillService = {
  async list(req: Request) {
    const { ship, status, from, to, mine } = req.query;
    const filter: Record<string, any> = {};
    if (req.user?.role === "superAdmin") throw new ApiError(403, "Forbidden");
    if (!["admin", "crew", "user"].includes(req.user?.role || "")) throw new ApiError(403, "Forbidden");
    if (ship) filter.ship = ship;
    if (status) filter.status = status;
    if (["crew", "user"].includes(req.user?.role || "")) filter["participants.crew"] = req.user?.id;
    if (mine === "true" && req.user?.id) filter["participants.crew"] = req.user.id;
    if (from || to) {
      filter.scheduledDate = {};
      if (from) filter.scheduledDate.$gte = new Date(String(from));
      if (to) filter.scheduledDate.$lte = new Date(String(to));
    }
    return SafetyDrillModel.find(filter).populate(populateDrill).sort({ scheduledDate: 1 });
  },

  async create(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const ship = await ShipModel.findById(req.body.ship);
    if (!ship) throw new ApiError(400, "Selected ship does not exist");
    if (ship.status === "inactive") {
      throw new ApiError(400, "Cannot schedule drills for an inactive ship");
    }

    const participantIds = [...new Set<string>(req.body.participants || [])];
    const participantCount = await UserModel.countDocuments({
      _id: { $in: participantIds },
      role: { $in: ["crew", "user"] },
    });
    if (participantIds.length === 0 || participantCount !== participantIds.length) {
      throw new ApiError(400, "All drill participants must be valid crew members");
    }

    const drill = await SafetyDrillModel.create({
      ...req.body,
      scheduledDate: new Date(req.body.scheduledDate),
      participants: participantsFromIds(participantIds),
      createdBy: req.user.id,
    });
    return drill.populate(populateDrill);
  },

  async update(req: Request) {
    const update = {
      ...req.body,
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
      participants: req.body.participants ? participantsFromIds(req.body.participants) : undefined,
    };
    const drill = await SafetyDrillModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate(populateDrill);
    if (!drill) throw new ApiError(404, "Safety drill not found");
    return drill;
  },

  async markParticipation(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const drill = await SafetyDrillModel.findById(req.params.id);
    if (!drill) throw new ApiError(404, "Safety drill not found");

    const participant = drill.participants.find(
      (item) => item.crew.toString() === req.user?.id
    );
    if (!participant) throw new ApiError(403, "You are not assigned to this drill");
    if (drill.status === "cancelled") throw new ApiError(400, "Cannot mark a cancelled drill");
    if (startOfDay(new Date()) < startOfDay(drill.scheduledDate)) {
      throw new ApiError(400, "Attendance can only be marked on or after the scheduled drill date");
    }
    if (req.body.completed && !req.body.attended) {
      throw new ApiError(400, "Drill completion requires attendance");
    }

    participant.attended = req.body.attended;
    participant.completed = req.body.completed;
    participant.note = req.body.note;
    participant.markedAt = new Date();

    const allCompleted = drill.participants.length > 0 && drill.participants.every((item) => item.completed);
    if (allCompleted) drill.status = "completed";

    await drill.save();
    return drill.populate(populateDrill);
  },
};
