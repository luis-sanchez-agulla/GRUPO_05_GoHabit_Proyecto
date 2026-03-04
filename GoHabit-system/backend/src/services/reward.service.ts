/**
 * ═══════════════════════════════════════════════════════════════
 * reward.service.ts — Servicio de recompensas y progreso
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona:
 *   - Catálogo de recompensas (listado público)
 *   - Canje de recompensas (gasta monedas del usuario)
 *   - Consulta de progreso del usuario (puntos, monedas, nivel)
 */

import { pool } from "@/lib/mysql";
import { rewardRepository } from "@/repositories/reward.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const rewardService = {
    /**
     * getAll — Devuelve todas las recompensas activas del catálogo.
     */
    async getAll() {
        return rewardRepository.findAllActive();
    },

    /**
     * redeem — Canjea una recompensa gastando monedas del usuario.
     */
    async redeem(userId: string, rewardId: string) {
        
    },

    /**
     * getUserProgress — Devuelve un resumen del progreso del usuario.
     */
    async getUserProgress(userId: string) {
        
    },
};

