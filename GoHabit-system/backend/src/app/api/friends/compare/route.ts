/**
 * GET /api/friends/compare — Comparar progreso con un amigo.
 * Query params: ?friendId=uuid
 */

import { withAuth } from "@/middleware/with-auth";
import { friendController } from "@/controllers/friend.controller";

export const GET = withAuth((req, ctx) => friendController.compareProgress(req, ctx));
