/**
 * GET /api/users — Listar todos los usuarios (perfil público).
 */

import { withAuth } from "@/middleware/with-auth";
import { userController } from "@/controllers/user.controller";

export const GET = withAuth((req, ctx) => userController.getUsers(req, ctx));
