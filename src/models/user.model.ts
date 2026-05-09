import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: "superAdmin" | "admin" | "crew" | "user";
  employeeId?: string;
  rank?: string;
  department?: "deck" | "engine" | "safety" | "operations" | "administration";
  phone?: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "crew", "user"],
      default: "crew",
    },
    employeeId: { type: String, trim: true, sparse: true, unique: true },
    rank: { type: String, trim: true },
    department: {
      type: String,
      enum: ["deck", "engine", "safety", "operations", "administration"],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
