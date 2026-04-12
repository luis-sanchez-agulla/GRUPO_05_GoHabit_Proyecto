/**
 * POST /api/friends/requests/[requestId]/accept — Acepta una solicitud de amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendController } from "@/controllers/friend.controller";

export const POST = withAuth((req: any, ctx: any) => friendController.acceptRequest(req, ctx));
