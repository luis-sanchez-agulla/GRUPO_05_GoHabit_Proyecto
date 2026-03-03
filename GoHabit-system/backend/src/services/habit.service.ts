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

import { pool } from "@/lib/mysql";
import { habitRepository } from "@/repositories/habit.repository";
import { NotFoundError } from "@/lib/errors";
import { POINTS, COINS } from "@/lib/constants";

export const habitService = {
    /**
     * getByUser — Lista todos los hábitos de un usuario.
     */
    async getByUser(userId: string) {
        return habitRepository.findAllByUserId(userId);
    },

    /**
     * getById — Obtiene un hábito específico con sus últimas 10 completions.
     */
    async getById(habitId: string, userId: string) {
        const habit = await habitRepository.findById(habitId);
        if (!habit || habit.userId !== userId) throw new NotFoundError('Habit');

        const completions = await habitRepository.findCompletions(habitId, 10);

        return { ...habit, completions };
    },

    /**
     * create — Crea un nuevo hábito para el usuario.
     */
    async create(userId: string, data: any) {
        const insertId = await habitRepository.create(userId, data);
        return habitRepository.findById(insertId.toString());
    },

    /**
     * update — Actualiza un hábito existente.
     */
    async update(habitId: string, userId: string, data: any) {
        const habit = await habitRepository.findById(habitId);
        if (!habit || habit.userId !== userId) throw new NotFoundError("Habit");

        if (Object.keys(data).length === 0) return this.getById(habitId, userId);

        await habitRepository.update(habitId, userId, data);
        return this.getById(habitId, userId);
    },

    /**
     * delete — Elimina un hábito y todas sus completions (Cascade).
     */
    async delete(habitId: string, userId: string) {
        const habit = await habitRepository.findById(habitId);
        if (!habit || habit.userId !== userId) throw new NotFoundError("Habit");

        await habitRepository.delete(habitId, userId);
        return { id: habitId, deleted: true };
    },

    /**
     * complete — Marca un hábito como completado (registra una completion).
     */
    async complete(habitId: string, userId: string, note?: string) {
        const habit = await habitRepository.findById(habitId);
        if (!habit || habit.userId !== userId) throw new NotFoundError("Habit");

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear el registro de completion
            const completionId = await habitRepository.createCompletion(habitId, userId, note, connection);

            // 2. Sumar puntos y monedas al usuario
            await habitRepository.updateUserStats(userId, POINTS.HABIT_COMPLETION, COINS.HABIT_COMPLETION, connection);

            await connection.commit();

            return habitRepository.findCompletionById(completionId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
    * checkStreaks — Calcula y actualiza la racha del usuario
    */
    async checkStreaks(userId: string, habitId: string): Promise<number> {
        const habit = await habitRepository.findById(habitId);
        if (!habit || habit.userId !== userId) throw new NotFoundError("Habit");

        const dates = await habitRepository.findCompletionDates(habitId, userId);

        if (!dates.length) {
            await habitRepository.updateUserStreak(userId, 0);
            return 0;
        }

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let compareDate = today;

        for (let i = dates.length - 1; i >= 0; i--) {
            const diff = (compareDate.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);

            if (diff === 0 || diff === 1) {
                streak++;
                compareDate = dates[i];
            } else if (diff > 1) {
                break;
            }
        }

        await habitRepository.updateUserStreak(userId, streak);
        return streak;
    }
};
