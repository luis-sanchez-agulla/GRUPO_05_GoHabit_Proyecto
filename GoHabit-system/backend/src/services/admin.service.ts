/**
 * ═══════════════════════════════════════════════════════════════
 * admin.service.ts — Servicio de administración
 * ═══════════════════════════════════════════════════════════════
 *
 * Solo accesible por usuarios con role ADMIN (protegido por withRole).
 * Gestiona: listado de usuarios, cambio de roles, estadísticas
 * globales y CRUD de recompensas.
 */

import { query, execute } from "@/lib/mysql";
import { NotFoundError } from "@/lib/errors";

export const adminService = {
    /**
     * getUsers — Lista todos los usuarios con paginación.
     *
     * @param page  - Número de página (empieza en 1)
     * @param limit - Usuarios por página (por defecto 20)
     *
     * Devuelve los usuarios + metadatos de paginación.
     */
    async getUsers(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const [users]: any = await query(
            'SELECT id, email, username, firstName, lastName, role, points, level, createdAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countRow]: any = await query('SELECT COUNT(*) as total FROM users');
        const total = countRow[0].total;

        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * updateUserRole — Cambia el rol de un usuario (USER ↔ ADMIN).
     */
    async updateUserRole(userId: string, role: "USER" | "ADMIN") {
        const [rows]: any = await query('SELECT id FROM users WHERE id = ?', [userId]);
        if (!rows || rows.length === 0) throw new NotFoundError("User");

        await execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

        const [updatedRows]: any = await query(
            'SELECT id, email, username, role FROM users WHERE id = ?',
            [userId]
        );
        return updatedRows[0];
    },

    /**
     * getStats — Estadísticas globales del sistema.
     */
    async getStats() {
        const queries = [
            query('SELECT COUNT(*) as count FROM users'),
            query('SELECT COUNT(*) as count FROM habits'),
            query('SELECT COUNT(*) as count FROM tasks'),
            query('SELECT COUNT(*) as count FROM habit_completions'),
        ];

        const [users, habits, tasks, completions]: any = await Promise.all(queries);

        return {
            totalUsers: users[0][0].count,
            totalHabits: habits[0][0].count,
            totalTasks: tasks[0][0].count,
            totalCompletions: completions[0][0].count,
        };
    },

    // ── Gestión de recompensas (solo admin) ──────────

    /** createReward — Crea una nueva recompensa en el catálogo. */
    async createReward(data: { name: string; description?: string; cost: number; icon?: string }) {
        const [result]: any = await execute(
            'INSERT INTO rewards (name, description, cost, icon) VALUES (?, ?, ?, ?)',
            [data.name, data.description || null, data.cost, data.icon || null]
        );
        const [rows]: any = await query('SELECT * FROM rewards WHERE id = ?', [result.insertId]);
        return rows[0];
    },

    /** updateReward — Actualiza una recompensa existente. */
    async updateReward(rewardId: string, data: { name?: string; description?: string; cost?: number; icon?: string; isActive?: boolean }) {
        const [existing]: any = await query('SELECT id FROM rewards WHERE id = ?', [rewardId]);
        if (!existing || existing.length === 0) throw new NotFoundError("Reward");

        const keys = Object.keys(data);
        if (keys.length === 0) {
            const [rows]: any = await query('SELECT * FROM rewards WHERE id = ?', [rewardId]);
            return rows[0];
        }

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        await execute(
            `UPDATE rewards SET ${setClause} WHERE id = ?`,
            [...values, rewardId]
        );

        const [updatedRows]: any = await query('SELECT * FROM rewards WHERE id = ?', [rewardId]);
        return updatedRows[0];
    },

    /** deleteReward — Elimina una recompensa del catálogo. */
    async deleteReward(rewardId: string) {
        const [existing]: any = await query('SELECT id FROM rewards WHERE id = ?', [rewardId]);
        if (!existing || existing.length === 0) throw new NotFoundError("Reward");

        await execute('DELETE FROM rewards WHERE id = ?', [rewardId]);
        return { id: rewardId, deleted: true };
    },
};
