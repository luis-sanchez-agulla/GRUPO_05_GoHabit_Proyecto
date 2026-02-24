/**
 * ═══════════════════════════════════════════════════════════════
 * task.service.ts — Servicio de gestión de tareas
 * ═══════════════════════════════════════════════════════════════
 *
 * Similar al habit.service pero para tareas puntuales (con fecha límite).
 * Incluye la lógica de vista calendario y la asignación de puntos
 * al marcar una tarea como completada.
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";
import type { CreateTaskInput, UpdateTaskInput } from "@/validations/task.schema";

export const taskService = {
    /**
     * getByUser — Lista todas las tareas del usuario.
     * Ordenadas: primero por fecha límite, luego por fecha de creación.
     */
    async getByUser(userId: string) {
        return prisma.task.findMany({
            where: { userId },
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        });
    },

    /** getById — Obtiene una tarea específica. Verifica propiedad. */
    async getById(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!task) throw new NotFoundError("Task");
        return task;
    },

    /**
     * create — Crea una nueva tarea.
     * Convierte los strings de fecha ISO 8601 a objetos Date de JavaScript.
     */
    async create(userId: string, data: CreateTaskInput) {
        return prisma.task.create({
            data: {
                ...data,
                userId,
                // new Date("2025-03-15T00:00:00Z") convierte string → Date
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            },
        });
    },

    /**
     * update — Actualiza una tarea existente.
     *
     * Lógica especial: si el status cambia a COMPLETED (y antes no lo era),
     * se ejecuta una transacción para:
     *   1. Actualizar la tarea (marcar completedAt)
     *   2. Otorgar puntos y monedas al usuario
     */
    async update(taskId: string, userId: string, data: UpdateTaskInput) {
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) throw new NotFoundError("Task");

        // Preparar los datos de actualización
        const updateData: Record<string, unknown> = { ...data };
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);

        // Caso especial: marcar como COMPLETED → otorgar puntos
        if (data.status === "COMPLETED" && task.status !== "COMPLETED") {
            return prisma.$transaction(async (tx) => {
                // 1. Actualizar la tarea + registrar la fecha de completion
                const updated = await tx.task.update({
                    where: { id: taskId },
                    data: { ...updateData, completedAt: new Date() },
                });

                // 2. Sumar puntos y monedas al usuario
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        points: { increment: POINTS.TASK_COMPLETION },  // +15 puntos
                        coins: { increment: COINS.TASK_COMPLETION },    // +10 monedas
                    },
                });

                return updated;
            });
        }

        // Si NO es completion, actualización normal sin transacción
        return prisma.task.update({
            where: { id: taskId },
            data: updateData,
        });
    },

    /** delete — Elimina una tarea. */
    async delete(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) throw new NotFoundError("Task");
        return prisma.task.delete({ where: { id: taskId } });
    },

    /**
     * getCalendar — Obtiene tareas para la vista calendario.
     * Filtra por rango de fechas (from → to) usando dueDate o scheduledAt.
     *
     * Ejemplo: GET /api/calendar?from=2025-03-01&to=2025-03-31
     * → Devuelve todas las tareas con fecha en marzo 2025.
     */
    async getCalendar(userId: string, from: Date, to: Date) {
        return prisma.task.findMany({
            where: {
                userId,
                OR: [
                    { dueDate: { gte: from, lte: to } },       // gte = ≥, lte = ≤
                    { scheduledAt: { gte: from, lte: to } },
                ],
            },
            orderBy: { dueDate: "asc" },
        });
    },
};
