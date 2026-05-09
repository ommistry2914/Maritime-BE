import { controllerHandler } from "../utils/controllerHandler";


export const getAdmin = controllerHandler(
  async () => {
    return { status: "admin route active" };
  },
  {
    statusCode: 200,
    message: "Admin endpoint fetched successfully",
  }
);

