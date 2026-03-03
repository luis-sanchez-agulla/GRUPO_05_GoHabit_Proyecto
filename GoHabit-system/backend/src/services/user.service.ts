/**
 * ═══════════════════════════════════════════════════════════════
 * user.service.ts — Servicio de perfil de usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona la lectura y actualización del perfil de usuario.
 * Ofrece dos vistas: perfil PRIVADO (datos completos del propio usuario)
 * y perfil PÚBLICO (datos visibles para otros usuarios).
 */

import { query, execute } from "@/lib/mysql";
import { NotFoundError, ConflictError } from "@/lib/errors";

export const userService = {
    /**
     * getProfile — Perfil PRIVADO (todos los datos excepto password).
     * Solo accesible por el propio usuario (GET /api/users, GET /api/auth/me).
     */
    async getProfile(userId: string) {
        const [rows]: any = await query(
            'SELECT id, email, username, firstName, lastName, avatarUrl, role, points, coins, level, createdAt FROM users WHERE id = ?',
            [userId]
        );
        if (!rows || rows.length === 0) throw new NotFoundError('User');
        return rows[0];
    },

    /**
     * getPublicProfile — Perfil PÚBLICO (datos limitados).
     * Accesible por cualquier usuario autenticado (GET /api/users/[userId]).
     * NO incluye email, monedas, ni datos sensibles.
     */
    async getPublicProfile(userId: string) {
        const [rows]: any = await query(
            'SELECT id, username, firstName, lastName, avatarUrl, level, points FROM users WHERE id = ?',
            [userId]
        );
        if (!rows || rows.length === 0) throw new NotFoundError('User');
        return rows[0];
    },

    /**
     * updateProfile — Actualiza el perfil del usuario autenticado.
     * Si cambia el username, verifica que no esté ya tomado.
     *
     * @throws ConflictError si el nuevo username ya está en uso por otro
     */
    async updateProfile(userId: string, data: any) {
        if (data.username) {
            const [existing]: any = await query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [data.username, userId]
            );
            if (existing && existing.length > 0) throw new ConflictError('Username already taken');
        }

        const keys = Object.keys(data);
        if (keys.length === 0) return this.getProfile(userId);

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        await execute(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            [...values, userId]
        );

        return this.getProfile(userId);
    },

    /**
    * setXpAndCoins — Método interno para actualizar puntos, monedas y nivel del usuario.
    * Se llama desde el servicio de tareas al completar una tarea.
    */
    async setXpAndCoins(userId: string, points: number, coins: number) {
        const [rows]: any = await query(
            'SELECT points, coins, level FROM users WHERE id = ?',
            [userId]
        );
        if (!rows || rows.length === 0) throw new NotFoundError('User');

        const user = rows[0];
        const updatedPoints = user.points + points;
        const updatedCoins = user.coins + coins;
        const newLevel = Math.floor(Math.sqrt(updatedPoints / 100));

        await execute(
            'UPDATE users SET points = ?, coins = ?, level = ? WHERE id = ?',
            [updatedPoints, updatedCoins, Math.max(newLevel, user.level), userId]
        );

        const [updatedRows]: any = await query(
            'SELECT id, points, coins, level FROM users WHERE id = ?',
            [userId]
        );
        return updatedRows[0];
    },
};
