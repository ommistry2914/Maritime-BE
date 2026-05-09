import mongoose, { Document, Schema, Types } from "mongoose";

export type DrillStatus = "scheduled" | "completed" | "cancelled";

export interface IDrillParticipant {
  crew: Types.ObjectId;
  attended: boolean;
  completed: boolean;
  note?: string;
  markedAt?: Date;
}

export interface ISafetyDrill extends Document {
  title: string;
  drillType: "fire" | "evacuation" | "manOverboard" | "abandonShip" | "medical" | "other";
  ship: Types.ObjectId;
  scheduledDate: Date;
  status: DrillStatus;
  participants: IDrillParticipant[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IDrillParticipant>(
  {
    crew: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attended: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    note: { type: String, trim: true },
    markedAt: { type: Date },
  },
  { _id: false }
);

const safetyDrillSchema = new Schema<ISafetyDrill>(
  {
    title: { type: String, required: true, trim: true },
    drillType: {
      type: String,
      enum: ["fire", "evacuation", "manOverboard", "abandonShip", "medical", "other"],
      required: true,
    },
    ship: { type: Schema.Types.ObjectId, ref: "Ship", required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    participants: { type: [participantSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

safetyDrillSchema.index({ ship: 1, scheduledDate: 1, status: 1 });
safetyDrillSchema.index({ "participants.crew": 1, scheduledDate: 1 });

export const SafetyDrillModel = mongoose.model<ISafetyDrill>(
  "SafetyDrill",
  safetyDrillSchema
);
