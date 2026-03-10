/**
 * POST /api/auth/register — Registrar nuevo usuario.
 */

import { withValidation } from "@/middleware/with-validation";
import { registerSchema } from "@/validations/auth.schema";
import { authController } from "@/controllers/auth.controller";

export const POST = withValidation(registerSchema, (req, ctx) => authController.register(req, ctx));
