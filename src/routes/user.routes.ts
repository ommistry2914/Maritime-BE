import { Router } from "express";
import { getUser, createUser } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../validation/validate";
import { createUserSchema } from "../validation/operations.validate";

const router = Router();

router.use(authenticate);
router.get("/", authorize("superAdmin", "admin"), getUser);
router.get("/getUser", authorize("superAdmin", "admin"), getUser);
router.post("/", authorize("superAdmin", "admin"), validate(createUserSchema), createUser);
router.post("/create", authorize("superAdmin", "admin"), validate(createUserSchema), createUser);

export default router;
