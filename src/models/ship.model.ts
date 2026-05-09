import mongoose, { Document, Schema } from "mongoose";

export interface IShip extends Document {
  name: string;
  imoNumber: string;
  vesselType: string;
  status: "operational" | "maintenance" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const shipSchema = new Schema<IShip>(
  {
    name: { type: String, required: true, trim: true },
    imoNumber: { type: String, required: true, unique: true, trim: true },
    vesselType: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["operational", "maintenance", "inactive"],
      default: "operational",
    },
  },
  { timestamps: true }
);

export const ShipModel = mongoose.model<IShip>("Ship", shipSchema);
