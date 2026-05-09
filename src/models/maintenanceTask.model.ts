import mongoose, { Document, Schema, Types } from "mongoose";

export type MaintenanceStatus = "pending" | "inProgress" | "completed";

export interface IMaintenanceComment {
  author: Types.ObjectId;
  note: string;
  createdAt: Date;
}

export interface IMaintenanceTask extends Document {
  title: string;
  description?: string;
  category: "engine" | "deck" | "electrical" | "hull" | "safetyEquipment" | "navigation" | "other";
  component: string;
  location?: string;
  ship: Types.ObjectId;
  assignedTo: Types.ObjectId;
  status: MaintenanceStatus;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours?: number;
  safetyCritical: boolean;
  dueDate: Date;
  completedAt?: Date;
  comments: IMaintenanceComment[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IMaintenanceComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const maintenanceTaskSchema = new Schema<IMaintenanceTask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["engine", "deck", "electrical", "hull", "safetyEquipment", "navigation", "other"],
      required: true,
    },
    component: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    ship: { type: Schema.Types.ObjectId, ref: "Ship", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "inProgress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    estimatedHours: { type: Number, min: 0.25, max: 500 },
    safetyCritical: { type: Boolean, default: false },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date },
    comments: { type: [commentSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

maintenanceTaskSchema.index({ ship: 1, status: 1, dueDate: 1 });
maintenanceTaskSchema.index({ assignedTo: 1, status: 1 });

export const MaintenanceTaskModel = mongoose.model<IMaintenanceTask>(
  "MaintenanceTask",
  maintenanceTaskSchema
);
