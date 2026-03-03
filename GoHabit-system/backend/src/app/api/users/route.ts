/**
 * GET /api/users — Obtener perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { userController } from "@/controllers/user.controller";

export const GET = withAuth((req, ctx) => userController.getProfile(req, ctx));
