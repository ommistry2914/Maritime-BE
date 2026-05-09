import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/db/index";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, config.ACCESS_SECRET!);
    req.user = decoded as any;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
