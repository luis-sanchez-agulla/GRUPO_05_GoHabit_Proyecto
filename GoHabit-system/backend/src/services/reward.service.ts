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

import { query, execute, pool } from "@/lib/mysql";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const rewardService = {
    /**
     * getAll — Devuelve todas las recompensas activas del catálogo.
     */
    async getAll() {
        const [rewards]: any = await query(
            'SELECT * FROM rewards WHERE isActive = 1 ORDER BY cost ASC'
        );
        return rewards;
    },

    /**
     * redeem — Canjea una recompensa gastando monedas del usuario.
     */
    async redeem(userId: string, rewardId: string) {
        const [rewards]: any = await query(
            'SELECT * FROM rewards WHERE id = ? AND isActive = 1',
            [rewardId]
        );
        if (!rewards || rewards.length === 0) throw new NotFoundError('Reward');
        const reward = rewards[0];

        const [users]: any = await query(
            'SELECT coins FROM users WHERE id = ?',
            [userId]
        );
        if (!users || users.length === 0) throw new NotFoundError('User');
        const user = users[0];

        if (user.coins < reward.cost) throw new ValidationError('Insufficient coins');

        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute(
                'INSERT INTO user_rewards (userId, rewardId) VALUES (?, ?)',
                [userId, rewardId]
            );
            await connection.execute(
                'UPDATE users SET coins = coins - ? WHERE id = ?',
                [reward.cost, userId]
            );
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
        const [userResult]: any = await query(
            "SELECT points, coins, level FROM users WHERE id = ?",
            [userId]
        );
        if (!userResult || userResult.length === 0) throw new NotFoundError("User");
        const user = userResult[0];

        const [habitsCompletedResult, tasksCompletedResult]: any = await Promise.all([
            query("SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?", [userId]),
            query("SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?", [userId, "COMPLETED"]),
        ]);

        return {
            ...user,
            habitsCompleted: habitsCompletedResult[0][0].count,
            tasksCompleted: tasksCompletedResult[0][0].count,
            currentStreak: 0,
        };
    },
};

