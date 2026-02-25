/**
 * DELETE /api/friends/[friendId] — Eliminar amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendService } from "@/services/friend.service";
import { noContent, error } from "@/lib/api-response";

export const DELETE = withAuth(async (_req, { user, params }) => {
    try {
        await friendService.removeFriend(params!.friendId, user.id);
        return noContent();
    } catch (err) {
        return error(err);
    }
});
