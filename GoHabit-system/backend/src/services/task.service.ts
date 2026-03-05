/**
 * ═══════════════════════════════════════════════════════════════
 * task.service.ts — Servicio de gestión de tareas
 * ═══════════════════════════════════════════════════════════════
 *
 * Similar al habit.service pero para tareas puntuales (con fecha límite).
 * Incluye la lógica de vista calendario y la asignación de puntos
 * al marcar una tarea como completada.
 */

import { pool } from "@/lib/mysql";
import { taskRepository } from "@/repositories/task.repository";
import { userService } from "@/services/user.service";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";

export const taskService = {
    /**
     * getByUser — Lista todas las tareas del usuario.
     */
    async getByUser(userId: string) {
        return taskRepository.findAllByUserId(userId);
    },

    /** getById — Obtiene una tarea específica. Verifica propiedad. */
    async getById(taskId: string, userId: string) {
        const task = await taskRepository.findById(taskId);
        if (!task || task.userId !== userId) throw new NotFoundError('Task');
        return task;
    },

    /**
     * create — Crea una nueva tarea.
     */
    async create(userId: string, data: any) {
        const insertId = await taskRepository.create(userId, data);
        return taskRepository.findById(insertId.toString());
    },

    /**
     * update — Actualiza una tarea existente.
     */
    async update(taskId: string, userId: string, data: any) {
        const task = await taskRepository.findById(taskId);
        if (!task || task.userId !== userId) throw new NotFoundError("Task");

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

                // 1. Actualizar la tarea
                await taskRepository.updateWithConnection(taskId, updateData, connection);

                // 2. Sumar puntos y monedas al usuario
                await userService.addProgress(userId, POINTS.TASK_COMPLETION, COINS.TASK_COMPLETION, connection);

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
            if (Object.keys(updateData).length === 0) return this.getById(taskId, userId);

            await taskRepository.update(taskId, userId, updateData);
            return this.getById(taskId, userId);
        }
    },

    /** delete — Elimina una tarea. */
    async delete(taskId: string, userId: string) {
        const task = await taskRepository.findById(taskId);
        if (!task || task.userId !== userId) throw new NotFoundError("Task");

        await taskRepository.delete(taskId, userId);
        return { id: taskId, deleted: true };
    },

    /**
     * getCalendar — Obtiene tareas para la vista calendario.
     */
    async getCalendar(userId: string, from: Date, to: Date) {
        return taskRepository.findByDateRange(userId, from, to);
    },
};
