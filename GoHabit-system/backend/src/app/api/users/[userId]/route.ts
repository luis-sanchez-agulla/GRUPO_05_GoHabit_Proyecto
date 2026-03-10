/**
 * GET /api/users/[userId] — Obtener perfil público de un usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { userController } from "@/controllers/user.controller";

export const GET = withAuth((req, ctx) => userController.getPublicProfile(req, ctx));
