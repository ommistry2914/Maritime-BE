import { controllerHandler } from "../utils/controllerHandler";
import { AuthService } from "../services/auth.service";

export const register = controllerHandler(
  async (req, res) => AuthService.register(req, res),
  { statusCode: 201, message: "User registered successfully" }
);

export const login = controllerHandler(
  async (req, res) => AuthService.login(req, res),
  { statusCode: 200, message: "Login successful" }
);

export const refresh = controllerHandler(
  async (req, res) => AuthService.refreshToken(req, res),
  { statusCode: 200, message: "Token refreshed successfully" }
);

export const logout = controllerHandler(
  async (req, res) => AuthService.logout(req, res),
  { statusCode: 200, message: "Logged out successfully" }
);

export const me = controllerHandler(
  async (req) => AuthService.me(req),
  { statusCode: 200, message: "Authenticated user fetched successfully" }
);
