/**
 * GET /api/calendar — Vista calendario de tareas.
 * Query params: ?from=2025-01-01&to=2025-01-31
 */

import { withAuth } from "@/middleware/with-auth";
import { taskService } from "@/services/task.service";
import { success, error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const GET = withAuth(async (req, { user }) => {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            throw new ValidationError("Query params 'from' and 'to' are required (ISO 8601)");
        }

        const tasks = await taskService.getCalendar(
            user.id,
            new Date(from),
            new Date(to)
        );

        return success(tasks);
    } catch (err) {
        return error(err);
    }
});
