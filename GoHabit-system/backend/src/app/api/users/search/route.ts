import { withAuth } from "@/middleware/with-auth";
import { userController } from "@/controllers/user.controller";

export const GET = withAuth((req, ctx) => userController.searchUsers(req, ctx));
