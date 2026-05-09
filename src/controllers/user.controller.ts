import { controllerHandler } from "../utils/controllerHandler";
import { UserService } from "../services/user.service";

export const getUser = controllerHandler(
  async (req) => UserService.list(req),
  {
    statusCode: 200,
    message: "Users fetched successfully",
  }
);

export const createUser = controllerHandler(
  async (req) => UserService.create(req),
  {
    statusCode: 201,
    message: "User created successfully",
  }
);
