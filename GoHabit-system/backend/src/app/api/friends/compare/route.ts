/**
 * GET /api/friends/compare — Comparar progreso con un amigo.
 * Query params: ?friendId=uuid
 */

import { withAuth } from "@/middleware/with-auth";
import { friendService } from "@/services/friend.service";
import { success, error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const GET = withAuth(async (req, { user }) => {
    try {
        const { searchParams } = new URL(req.url);
        const friendId = searchParams.get("friendId");

        if (!friendId) {
            throw new ValidationError("Query param 'friendId' is required");
        }

        const comparison = await friendService.compareProgress(user.id, friendId);
        return success(comparison);
    } catch (err) {
        return error(err);
    }
});
