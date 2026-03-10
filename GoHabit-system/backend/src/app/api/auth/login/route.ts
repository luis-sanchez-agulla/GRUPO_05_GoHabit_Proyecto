/**
 * POST /api/auth/login — Iniciar sesión.
 */

import { withValidation } from "@/middleware/with-validation";
import { loginSchema } from "@/validations/auth.schema";
import { authController } from "@/controllers/auth.controller";

export const POST = withValidation(loginSchema, (req, ctx) => authController.login(req, ctx));
