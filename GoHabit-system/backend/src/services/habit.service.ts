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

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";   // Cuántos puntos/monedas otorgar
import type { CreateHabitInput, UpdateHabitInput } from "@/validations/habit.schema";

export const habitService = {
    /**
     * getByUser — Lista todos los hábitos de un usuario.
     * Ordenados por fecha de creación (más recientes primero).
     */
    async getByUser(userId: string) {
        return prisma.habit.findMany({
            where: { userId },                 // Solo hábitos de ESTE usuario
            orderBy: { createdAt: "desc" },    // Más recientes primero
        });
    },

    /**
     * getById — Obtiene un hábito específico con sus últimas 10 completions.
     * Verifica que el hábito pertenece al usuario (seguridad).
     *
     * @throws NotFoundError si no existe o no le pertenece al usuario
     */
    async getById(habitId: string, userId: string) {
        const habit = await prisma.habit.findFirst({
            where: { id: habitId, userId },   // Filtro: ID + que sea del usuario
            include: {
                completions: {                   // Incluir las completions relacionadas
                    orderBy: { completedAt: "desc" },
                    take: 10,                      // Solo las últimas 10
                },
            },
        });

        if (!habit) throw new NotFoundError("Habit");
        return habit;
    },

    /**
     * create — Crea un nuevo hábito para el usuario.
     * El spread operator (...data) copia todos los campos del input.
     */
    async create(userId: string, data: CreateHabitInput) {
        return prisma.habit.create({
            data: { ...data, userId },   // Añadimos el userId del usuario autenticado
        });
    },

    /**
     * update — Actualiza un hábito existente.
     * Primero verifica que existe y pertenece al usuario.
     */
    async update(habitId: string, userId: string, data: UpdateHabitInput) {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) throw new NotFoundError("Habit");

        return prisma.habit.update({
            where: { id: habitId },
            data,   // Solo actualiza los campos que se enviaron
        });
    },

    /**
     * delete — Elimina un hábito y todas sus completions (Cascade).
     * La opción onDelete: Cascade en schema.prisma se encarga de
     * eliminar las completions asociadas automáticamente.
     */
    async delete(habitId: string, userId: string) {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) throw new NotFoundError("Habit");

        return prisma.habit.delete({ where: { id: habitId } });
    },

    /**
     * complete — Marca un hábito como completado (registra una completion).
     *
     * ¿Qué es una transacción ($transaction)?
     * Ejecuta varias operaciones de BD como UNA SOLA operación atómica:
     *   - Si ambas tienen éxito → se guardan los cambios
     *   - Si alguna falla → se revierten TODOS los cambios
     *
     * Esto garantiza que:
     *   1. Se crea el registro de completion
     *   2. Se suman los puntos/monedas al usuario
     * ...ambas cosas ocurren juntas. Nunca se crearán puntos sin completion
     * ni completion sin puntos.
     *
     * @param habitId - ID del hábito a completar
     * @param userId  - ID del usuario que lo completa
     * @param note    - Nota opcional (ej: "Hoy medité 15 min en vez de 10")
     */
    async complete(habitId: string, userId: string, note?: string) {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) throw new NotFoundError("Habit");

        // Transacción: ambas operaciones se ejecutan juntas o ninguna
        return prisma.$transaction(async (tx) => {
            // 1. Crear el registro de completion
            const completion = await tx.habitCompletion.create({
                data: { habitId, userId, note },
            });

            // 2. Sumar puntos y monedas al usuario
            // { increment: N } suma N al valor actual (no reemplaza)
            await tx.user.update({
                where: { id: userId },
                data: {
                    points: { increment: POINTS.HABIT_COMPLETION },  // +10 puntos
                    coins: { increment: COINS.HABIT_COMPLETION },    // +5 monedas
                },
            });

            return completion;
        });
    },
};
