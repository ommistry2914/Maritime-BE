import { Request } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

const safeSelect = "-password -refreshToken";

const toSafeUser = (user: any) => ({
  id: user._id?.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  employeeId: user.employeeId,
  rank: user.rank,
  department: user.department,
  phone: user.phone,
});

export const UserService = {
  async list(req: Request) {
    const { role, search } = req.query;
    const filter: Record<string, any> = {};

    if (req.user?.role === "superAdmin") {
      filter.role = "admin";
    } else if (req.user?.role === "admin") {
      filter.role = role || { $in: ["crew", "user"] };
    } else {
      throw new ApiError(403, "Forbidden");
    }

    if (search) {
      filter.$or = [
        { firstName: new RegExp(String(search), "i") },
        { lastName: new RegExp(String(search), "i") },
        { email: new RegExp(String(search), "i") },
        { employeeId: new RegExp(String(search), "i") },
      ];
    }
    const users = await UserModel.find(filter).select(safeSelect).sort({ firstName: 1 });
    return users.map(toSafeUser);
  },

  async create(req: Request) {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const { firstName, lastName, email, password, role, employeeId, rank, department, phone } = req.body;

    if (req.user.role === "superAdmin" && role !== "admin") {
      throw new ApiError(403, "Super admin can only create admin accounts");
    }

    if (req.user.role === "admin" && !["crew", "user"].includes(role)) {
      throw new ApiError(403, "Admin can only create crew accounts");
    }

    if (!["superAdmin", "admin"].includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }

    const existing = await UserModel.findOne({
      $or: [
        { email },
        ...(employeeId ? [{ employeeId }] : []),
      ],
    });
    if (existing) throw new ApiError(400, "User with this email or employee id already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      employeeId,
      rank,
      department,
      phone,
    });

    const createdUser = await UserModel.findById(user._id).select(safeSelect);
    return toSafeUser(createdUser);
  },
};
