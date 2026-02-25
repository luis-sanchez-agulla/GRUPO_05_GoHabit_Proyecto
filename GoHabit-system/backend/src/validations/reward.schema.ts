/**
 * ═══════════════════════════════════════════════════════════════
 * reward.schema.ts — Schemas de validación para recompensas
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from "zod";

/** createRewardSchema — body de POST /api/admin/rewards (solo admin). */
export const createRewardSchema = z.object({
    name: z.string().min(1, "Nombre requerido").max(100),
    description: z.string().max(500).optional(),
    cost: z.number().int().min(1, "Coste mínimo: 1"),  // Coste en monedas (entero positivo)
    icon: z.string().max(30).optional(),
});

/** updateRewardSchema — body de PUT /api/admin/rewards. */
export const updateRewardSchema = createRewardSchema.partial().extend({
    isActive: z.boolean().optional(),  // Permite desactivar recompensas del catálogo
});

/**
 * redeemRewardSchema — body de POST /api/rewards/redeem.
 * El usuario envía el ID de la recompensa que quiere canjear.
 */
export const redeemRewardSchema = z.object({
    rewardId: z.string().uuid("ID de recompensa inválido"),  // Debe ser un UUID válido
});

export type CreateRewardInput = z.infer<typeof createRewardSchema>;
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
