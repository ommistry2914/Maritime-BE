import { controllerHandler } from "../utils/controllerHandler";
import { ShipService } from "../services/ship.service";

export const listShips = controllerHandler(
  async (req) => ShipService.list(req),
  { message: "Ships fetched successfully" }
);

export const createShip = controllerHandler(
  async (req) => ShipService.create(req),
  { statusCode: 201, message: "Ship created successfully" }
);

export const updateShip = controllerHandler(
  async (req) => ShipService.update(req),
  { message: "Ship updated successfully" }
);
