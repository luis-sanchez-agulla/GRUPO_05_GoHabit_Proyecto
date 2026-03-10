/**
 * GET  /api/habits — Listar hábitos del usuario.
 * POST /api/habits — Crear un nuevo hábito.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { createHabitSchema } from "@/validations/habit.schema";
import { habitController } from "@/controllers/habit.controller";

export const GET = withAuth((req, ctx) => habitController.getAll(req, ctx));
export const POST = withAuth(withValidation(createHabitSchema, (req, ctx) => habitController.create(req, ctx)));
