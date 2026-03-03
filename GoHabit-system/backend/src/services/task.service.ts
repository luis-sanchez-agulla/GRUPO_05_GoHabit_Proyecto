/**
 * ═══════════════════════════════════════════════════════════════
 * task.service.ts — Servicio de gestión de tareas
 * ═══════════════════════════════════════════════════════════════
 *
 * Similar al habit.service pero para tareas puntuales (con fecha límite).
 * Incluye la lógica de vista calendario y la asignación de puntos
 * al marcar una tarea como completada.
 */

import { query, execute, pool } from "@/lib/mysql";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";

export const taskService = {
    /**
     * getByUser — Lista todas las tareas del usuario.
     */
    async getByUser(userId: string) {
        const [tasks]: any = await query(
            'SELECT * FROM tasks WHERE userId = ? ORDER BY dueDate ASC, createdAt DESC',
            [userId]
        );
        return tasks;
    },

    /** getById — Obtiene una tarea específica. Verifica propiedad. */
    async getById(taskId: string, userId: string) {
        const [tasks]: any = await query(
            'SELECT * FROM tasks WHERE id = ? AND userId = ?',
            [taskId, userId]
        );
        if (!tasks || tasks.length === 0) throw new NotFoundError('Task');
        return tasks[0];
    },

    /**
     * create — Crea una nueva tarea.
     */
    async create(userId: string, data: any) {
        const { title, description, dueDate, scheduledAt, priority, category } = data;
        const [result]: any = await execute(
            'INSERT INTO tasks (userId, title, description, dueDate, scheduledAt, priority, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                userId,
                title,
                description || null,
                dueDate ? new Date(dueDate) : null,
                scheduledAt ? new Date(scheduledAt) : null,
                priority || 'MEDIUM',
                category || null
            ]
        );
        const [newTask]: any = await query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        return newTask[0];
    },

    /**
     * update — Actualiza una tarea existente.
     */
    async update(taskId: string, userId: string, data: any) {
        const [tasks]: any = await query(
            "SELECT * FROM tasks WHERE id = ? AND userId = ?",
            [taskId, userId]
        );
        if (!tasks || tasks.length === 0) throw new NotFoundError("Task");
        const task = tasks[0];

        // Preparar los datos de actualización
        const updateData: Record<string, any> = { ...data };
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);

        // Caso especial: marcar como COMPLETED → otorgar puntos
        if (data.status === "COMPLETED" && task.status !== "COMPLETED") {
            const connection = await pool.getConnection();
            await connection.beginTransaction();
            try {
                updateData.completedAt = new Date();

                const keys = Object.keys(updateData);
                const setClause = keys.map(key => `${key} = ?`).join(', ');
                const values = Object.values(updateData);

                // 1. Actualizar la tarea
                await connection.execute(
                    `UPDATE tasks SET ${setClause} WHERE id = ?`,
                    [...values, taskId]
                );

                // 2. Sumar puntos y monedas al usuario
                await connection.execute(
                    "UPDATE users SET points = points + ?, coins = coins + ? WHERE id = ?",
                    [POINTS.TASK_COMPLETION, COINS.TASK_COMPLETION, userId]
                );

                await connection.commit();
                return this.getById(taskId, userId);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } else {
            // Si NO es completion, actualización normal sin transacción
            const keys = Object.keys(updateData);
            if (keys.length === 0) return this.getById(taskId, userId);

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);

            await execute(
                `UPDATE tasks SET ${setClause} WHERE id = ?`,
                [...values, taskId]
            );
            return this.getById(taskId, userId);
        }
    },

    /** delete — Elimina una tarea. */
    async delete(taskId: string, userId: string) {
        const [tasks]: any = await query(
            "SELECT id FROM tasks WHERE id = ? AND userId = ?",
            [taskId, userId]
        );
        if (!tasks || tasks.length === 0) throw new NotFoundError("Task");

        await execute("DELETE FROM tasks WHERE id = ?", [taskId]);
        return { id: taskId, deleted: true };
    },

    /**
     * getCalendar — Obtiene tareas para la vista calendario.
     */
    async getCalendar(userId: string, from: Date, to: Date) {
        const [tasks]: any = await query(
            `SELECT * FROM tasks WHERE userId = ? AND 
            (dueDate BETWEEN ? AND ? OR scheduledAt BETWEEN ? AND ?)
            ORDER BY dueDate ASC`,
            [userId, from, to, from, to]
        );
        return tasks;
    },
};
