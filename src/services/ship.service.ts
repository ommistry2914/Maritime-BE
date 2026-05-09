import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { ShipModel } from "../models/ship.model";

export const ShipService = {
  async list(req: Request) {
    const { status, search } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(String(search), "i") },
        { imoNumber: new RegExp(String(search), "i") },
      ];
    }
    return ShipModel.find(filter).sort({ name: 1 });
  },

  async create(req: Request) {
    const existing = await ShipModel.findOne({ imoNumber: req.body.imoNumber });
    if (existing) throw new ApiError(400, "Ship with this IMO number already exists");
    return ShipModel.create(req.body);
  },

  async update(req: Request) {
    const ship = await ShipModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ship) throw new ApiError(404, "Ship not found");
    return ship;
  },
};
