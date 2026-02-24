/**
 * GET  /api/friends — Listar amigos.
 * POST /api/friends — Enviar solicitud de amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendService } from "@/services/friend.service";
import { sendFriendRequestSchema } from "@/validations/friend.schema";
import { success, created, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const friends = await friendService.getFriends(user.id);
        return success(friends);
    } catch (err) {
        return error(err);
    }
});

export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const { receiverId } = sendFriendRequestSchema.parse(body);
        const request = await friendService.sendRequest(user.id, receiverId);
        return created(request);
    } catch (err) {
        return error(err);
    }
});
