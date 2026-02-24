/**
 * ═══════════════════════════════════════════════════════════════
 * friend.schema.ts — Schemas de validación para amistades
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from "zod";

/**
 * sendFriendRequestSchema — body de POST /api/friends.
 * El usuario envía el ID del usuario al que quiere añadir como amigo.
 */
export const sendFriendRequestSchema = z.object({
    receiverId: z.string().uuid("ID de usuario inválido"),
});

/**
 * respondFriendRequestSchema — para responder a una solicitud de amistad.
 * Solo puede ser ACCEPTED (aceptar) o REJECTED (rechazar).
 */
export const respondFriendRequestSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;
