import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import { UserModel } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies";

const toSafeUser = (user: any) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  employeeId: user.employeeId,
  rank: user.rank,
  department: user.department,
  phone: user.phone,
});

export const AuthService = {
  async register(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      throw new ApiError(400, "Name, email, and password are required");

    const existing = await UserModel.findOne({ email });
    if (existing) throw new ApiError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "crew",
    });

    const accessToken = generateAccessToken({ id: user._id, email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, email, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);

    return { user: toSafeUser(user) };
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ApiError(400, "Email and password are required");

    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new ApiError(401, "Invalid email or password");

    const accessToken = generateAccessToken({ id: user._id, email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, email, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);

    return { user: toSafeUser(user) };
  },

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new ApiError(400, "Refresh token required");

    const user = await UserModel.findOne({ refreshToken });
    if (!user) throw new ApiError(401, "Invalid refresh token");

    try {
      const decoded = verifyRefreshToken(refreshToken) as {
        id: string;
        email: string;
        role: "superAdmin" | "admin" | "crew" | "user";
      };

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });
      const newRefreshToken = generateRefreshToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });

      user.refreshToken = newRefreshToken;
      await user.save();
      setAuthCookies(res, newAccessToken, newRefreshToken);

      return { user: toSafeUser(user) };
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      const user = await UserModel.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    clearAuthCookies(res);

    return { message: "Logged out successfully" };
  },

  async me(req: Request) {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    const user = await UserModel.findById(req.user.id).select("-password -refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    return { user: toSafeUser(user) };
  },
};
