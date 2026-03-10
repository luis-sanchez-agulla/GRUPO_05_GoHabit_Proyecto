/**
 * PUT /api/users/profile — Editar perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { updateProfileSchema } from "@/validations/user.schema";
import { userController } from "@/controllers/user.controller";

export const PUT = withAuth(withValidation(updateProfileSchema, (req, ctx) => userController.updateProfile(req, ctx)));
