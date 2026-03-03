/**
 * POST /api/auth/logout — Cerrar sesión.
 * Con JWT stateless, el logout es responsabilidad del cliente (eliminar token).
 * Este endpoint existe como punto de extensión (e.g. blacklist de tokens).
 */

import { authController } from "@/controllers/auth.controller";

export const POST = (req: any, ctx: any) => authController.logout(req, ctx);
