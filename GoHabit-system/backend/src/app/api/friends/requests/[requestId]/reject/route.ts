/**
 * POST /api/friends/requests/[requestId]/reject — Rechaza una solicitud de amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendController } from "@/controllers/friend.controller";

export const POST = withAuth((req: any, ctx: any) => friendController.rejectRequest(req, ctx));
