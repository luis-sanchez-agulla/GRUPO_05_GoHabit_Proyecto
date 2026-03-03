/**
 * GET  /api/friends — Listar amigos.
 * POST /api/friends — Enviar solicitud de amistad.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { sendFriendRequestSchema } from "@/validations/friend.schema";
import { friendController } from "@/controllers/friend.controller";

export const GET = withAuth((req, ctx) => friendController.getFriends(req, ctx));
export const POST = withAuth(withValidation(sendFriendRequestSchema, (req, ctx) => friendController.sendRequest(req, ctx)));
