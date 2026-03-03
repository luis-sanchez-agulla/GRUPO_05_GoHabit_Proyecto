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
        const reward = await rewardRepository.findById(rewardId);
        if (!reward || !reward.isActive) throw new NotFoundError('Reward');

        const userCoins = await rewardRepository.getUserCoins(userId);
        if (userCoins < reward.cost) throw new ValidationError('Insufficient coins');

        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            await rewardRepository.createRedemption(userId, rewardId, connection);
            await rewardRepository.subtractCoins(userId, reward.cost, connection);
            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * getUserProgress — Devuelve un resumen del progreso del usuario.
     */
    async getUserProgress(userId: string) {
        const user = await rewardRepository.getUserStats(userId);
        if (!user) throw new NotFoundError("User");

        const [habitsCompleted, tasksCompleted] = await Promise.all([
            rewardRepository.countHabitCompletions(userId),
            rewardRepository.countTasksCompleted(userId),
        ]);

        return {
            ...user,
            habitsCompleted,
            tasksCompleted,
            currentStreak: 0,
        };
    },
};

