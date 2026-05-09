import { controllerHandler } from "../utils/controllerHandler";
import { DrillService } from "../services/drill.service";

export const listSafetyDrills = controllerHandler(
  async (req) => DrillService.list(req),
  { message: "Safety drills fetched successfully" }
);

export const createSafetyDrill = controllerHandler(
  async (req) => DrillService.create(req),
  { statusCode: 201, message: "Safety drill scheduled successfully" }
);

export const updateSafetyDrill = controllerHandler(
  async (req) => DrillService.update(req),
  { message: "Safety drill updated successfully" }
);

export const markDrillParticipation = controllerHandler(
  async (req) => DrillService.markParticipation(req),
  { message: "Drill participation updated successfully" }
);
