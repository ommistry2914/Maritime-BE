import { Router } from "express";
import { login, register, refresh, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../validation/validate";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../validation/auth.validate";

const router = Router();

router.post("/register",validate(registerSchema) ,register);
router.post("/login",validate(loginSchema) ,login);
router.post("/refresh",validate(refreshSchema) ,refresh);
router.post("/logout",validate(logoutSchema) ,logout);
router.get("/me", authenticate, me);

export default router;
