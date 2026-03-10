/**
 * GET /api/habits/[habitId]/streaks — Obtener la racha actual de un hábito.
 */

import { withAuth } from "@/middleware/with-auth";
import { habitController } from "@/controllers/habit.controller";

export const GET = withAuth((req, ctx) => habitController.checkStreaks(req, ctx));
