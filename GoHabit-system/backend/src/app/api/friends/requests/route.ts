/**
 * GET /api/friends/requests — Lista las solicitudes de amistad pendientes recibidas.
 */

import { withAuth } from "@/middleware/with-auth";
import { friendController } from "@/controllers/friend.controller";

export const GET = withAuth((req: any, ctx: any) => friendController.getPendingRequests(req, ctx));
