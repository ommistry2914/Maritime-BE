import { Response } from "express";
import config from "../config/db";

const isProduction = config.node_env === "production";

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("refreshToken", authCookieOptions);
};
