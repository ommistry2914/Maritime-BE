import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const dateString = z.string().datetime().or(z.string().min(10));
const optionalEmployeeId = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(2, "Employee ID must be at least 2 characters").optional()
);
const optionalRank = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(2, "Rank or designation must be at least 2 characters").optional()
);
const phoneNumber = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(20, "Phone number must be at most 20 characters")
  .regex(/^\+?[0-9\s().-]+$/, "Phone number can only contain digits, spaces, +, -, . and parentheses");
const futureOrTodayDate = dateString.refine((value) => {
  const input = new Date(value);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return !Number.isNaN(input.getTime()) && input >= startOfToday;
}, "Date cannot be in the past");

export const createShipSchema = z.object({
  name: z.string().trim().min(2),
  imoNumber: z.string().trim().min(3),
  vesselType: z.string().trim().min(2),
  status: z.enum(["operational", "maintenance", "inactive"]).optional(),
});

export const updateShipSchema = createShipSchema.partial();

export const createMaintenanceTaskSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  category: z.enum(["engine", "deck", "electrical", "hull", "safetyEquipment", "navigation", "other"]),
  component: z.string().trim().min(2, "Component is required"),
  location: z.string().trim().optional(),
  ship: objectId,
  assignedTo: objectId,
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  estimatedHours: z.coerce.number().min(0.25).max(500).optional(),
  safetyCritical: z.coerce.boolean().default(false),
  dueDate: futureOrTodayDate,
});

export const updateMaintenanceTaskSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().optional(),
  category: z.enum(["engine", "deck", "electrical", "hull", "safetyEquipment", "navigation", "other"]).optional(),
  component: z.string().trim().min(2).optional(),
  location: z.string().trim().optional(),
  ship: objectId.optional(),
  assignedTo: objectId.optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  estimatedHours: z.coerce.number().min(0.25).max(500).optional(),
  safetyCritical: z.coerce.boolean().optional(),
  dueDate: dateString.optional(),
  status: z.enum(["pending", "inProgress", "completed"]).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["pending", "inProgress", "completed"]),
  note: z.string().trim().min(1).optional(),
});

export const addCommentSchema = z.object({
  note: z.string().trim().min(1),
});

export const createSafetyDrillSchema = z.object({
  title: z.string().trim().min(3),
  drillType: z.enum(["fire", "evacuation", "manOverboard", "abandonShip", "medical", "other"]),
  ship: objectId,
  location: z.string().trim().min(2, "Drill location is required"),
  musterStation: z.string().trim().min(2, "Muster station is required"),
  objective: z.string().trim().min(10, "Objective must be at least 10 characters").optional(),
  durationMinutes: z.coerce.number().min(5).max(480),
  scheduledDate: futureOrTodayDate,
  participants: z.array(objectId).min(1, "At least one crew member is required"),
});

export const updateSafetyDrillSchema = z.object({
  title: z.string().trim().min(3).optional(),
  drillType: z.enum(["fire", "evacuation", "manOverboard", "abandonShip", "medical", "other"]).optional(),
  ship: objectId.optional(),
  location: z.string().trim().min(2).optional(),
  musterStation: z.string().trim().min(2).optional(),
  objective: z.string().trim().optional(),
  durationMinutes: z.coerce.number().min(5).max(480).optional(),
  scheduledDate: dateString.optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  participants: z.array(objectId).optional(),
});

export const markDrillSchema = z.object({
  attended: z.boolean().default(true),
  completed: z.boolean().default(true),
  note: z.string().trim().optional(),
});

export const createUserSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "crew", "user"]),
  employeeId: optionalEmployeeId,
  rank: optionalRank,
  department: z.enum(["deck", "engine", "safety", "operations", "administration"]).optional(),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    phoneNumber.optional()
  ),
}).superRefine((data, ctx) => {
  if (data.role === "admin") return;

  if (!data.employeeId) {
    ctx.addIssue({
      code: "custom",
      path: ["employeeId"],
      message: "Employee ID is required",
    });
  }

  if (!data.rank) {
    ctx.addIssue({
      code: "custom",
      path: ["rank"],
      message: "Rank or designation is required",
    });
  }

  if (!data.department) {
    ctx.addIssue({
      code: "custom",
      path: ["department"],
      message: "Department is required",
    });
  }

  if (!data.phone) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Phone number is required",
    });
  }
});
