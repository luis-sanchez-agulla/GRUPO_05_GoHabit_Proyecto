/**
 * ═══════════════════════════════════════════════════════════════
 * habit.service.ts — Servicio de gestión de hábitos
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona todo el CRUD de hábitos y el sistema de completado.
 * Cuando un usuario completa un hábito, se registra la completion
 * y se le otorgan puntos y monedas en una TRANSACCIÓN (para que
 * ambas operaciones ocurran juntas o ninguna).
 */

import { query, execute, pool } from "@/lib/mysql";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";

export const habitService = {
    /**
     * getByUser — Lista todos los hábitos de un usuario.
     */
    async getByUser(userId: string) {
        const [habits]: any = await query(
            'SELECT * FROM habits WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        return habits;
    },

    /**
     * getById — Obtiene un hábito específico con sus últimas 10 completions.
     */
    async getById(habitId: string, userId: string) {
        const [habits]: any = await query(
            'SELECT * FROM habits WHERE id = ? AND userId = ?',
            [habitId, userId]
        );
        if (!habits || habits.length === 0) throw new NotFoundError('Habit');

        const [completions]: any = await query(
            'SELECT * FROM habit_completions WHERE habitId = ? ORDER BY completedAt DESC LIMIT 10',
            [habitId]
        );

        return { ...habits[0], completions };
    },

    /**
     * create — Crea un nuevo hábito para el usuario.
     */
    async create(userId: string, data: any) {
        const { title, description, frequency, category, icon, color } = data;
        const [result]: any = await execute(
            "INSERT INTO habits (userId, title, description, frequency, category, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, title, description || null, frequency || 'DAILY', category || null, icon || null, color || null]
        );
        const [rows]: any = await query('SELECT * FROM habits WHERE id = ?', [result.insertId]);
        return rows[0];
    },

    /**
     * update — Actualiza un hábito existente.
     */
    async update(habitId: string, userId: string, data: any) {
        const [habits]: any = await query(
            "SELECT id FROM habits WHERE id = ? AND userId = ?",
            [habitId, userId]
        );
        if (!habits || habits.length === 0) throw new NotFoundError("Habit");

        const keys = Object.keys(data);
        if (keys.length === 0) return this.getById(habitId, userId);

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        await execute(
            `UPDATE habits SET ${setClause} WHERE id = ?`,
            [...values, habitId]
        );

        return this.getById(habitId, userId);
    },

    /**
     * delete — Elimina un hábito y todas sus completions (Cascade).
     */
    async delete(habitId: string, userId: string) {
        const [habits]: any = await query(
            "SELECT id FROM habits WHERE id = ? AND userId = ?",
            [habitId, userId]
        );
        if (!habits || habits.length === 0) throw new NotFoundError("Habit");

        await execute("DELETE FROM habits WHERE id = ?", [habitId]);
        return { id: habitId, deleted: true };
    },

    /**
     * complete — Marca un hábito como completado (registra una completion).
     */
    async complete(habitId: string, userId: string, note?: string) {
        const [habits]: any = await query('SELECT id FROM habits WHERE id = ? AND userId = ?', [habitId, userId]);
        if (!habits || habits.length === 0) throw new NotFoundError("Habit");

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear el registro de completion
            const [result]: any = await connection.execute(
                'INSERT INTO habit_completions (habitId, userId, note) VALUES (?, ?, ?)',
                [habitId, userId, note || null]
            );

            // 2. Sumar puntos y monedas al usuario
            await connection.execute(
                'UPDATE users SET points = points + ?, coins = coins + ? WHERE id = ?',
                [POINTS.HABIT_COMPLETION, COINS.HABIT_COMPLETION, userId]
            );

            await connection.commit();

            const [completionRows]: any = await query('SELECT * FROM habit_completions WHERE id = ?', [result.insertId]);
            return completionRows[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};
};
