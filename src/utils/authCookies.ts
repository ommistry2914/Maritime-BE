import { Response } from "express";
import config from "../config/db";

/**
 * When the frontend and backend are on different domains (e.g. Vercel deployments),
 * the browser will only send cookies if:
 *   - The cookie has SameSite=None
 *   - The cookie has Secure=true  (HTTPS required by all browsers)
 *
 * We detect "cross-site" by checking if VERCEL is set (serverless) OR if NODE_ENV
 * is explicitly "production". Locally (same-origin via proxy) lax/non-secure is fine.
 */
const isCrossSite = !!process.env.VERCEL || config.node_env === "production";

export const authCookieOptions = {
  httpOnly: true,
  secure: isCrossSite,                            // must be true for SameSite=None
  sameSite: isCrossSite ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: 15 * 60 * 1000,           // 15 min
  });
  res.cookie("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("refreshToken", authCookieOptions);
};
