/**
 * GET /api/calendar — Vista calendario de tareas.
 * Query params: ?from=2025-01-01&to=2025-01-31
 */

import { withAuth } from "@/middleware/with-auth";
import { taskController } from "@/controllers/task.controller";

export const GET = withAuth((req, ctx) => taskController.getCalendar(req, ctx));
