/**
 * GET /api/auth/me — Obtener perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { authController } from "@/controllers/auth.controller";

export const GET = withAuth((req, ctx) => authController.me(req, ctx));
