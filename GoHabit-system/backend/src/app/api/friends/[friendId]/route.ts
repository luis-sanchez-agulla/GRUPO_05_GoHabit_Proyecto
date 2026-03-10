/**
 * DELETE /api/friends/[friendId] — Eliminar amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendController } from "@/controllers/friend.controller";

export const DELETE = withAuth((req, ctx) => friendController.removeFriend(req, ctx));
