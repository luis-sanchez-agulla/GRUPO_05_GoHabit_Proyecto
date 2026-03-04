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

            // 3. Actualizar la racha
            const newStreak = await this.checkStreaks(userId, habitId);

            await connection.commit();

            const completion = await habitRepository.findCompletionById(completionId);
            return { ...completion, currentStreak: newStreak };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
    * checkStreaks — Calcula la racha específica de un hábito recorriendo su historial.
    * 
    * Explicación para principiantes:
    * - No guardamos la racha en una tabla aparte, sino que cada vez que la necesitamos, 
    *   la calculamos mirando las fechas en 'habit_completions'.
    */
    async checkStreaks(userId: string, habitId: string): Promise<number> {
        // 1. Buscamos todas las fechas en las que se completó este hábito (ordenadas de vieja a nueva)
        const dates = await habitRepository.findCompletionDates(habitId, userId);

        if (!dates.length) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Empezamos comparando desde hoy
        let compareDate = today;

        // Recorremos las fechas de la más reciente (final del array) a la más antigua
        for (let i = dates.length - 1; i >= 0; i--) {
            const completionDate = dates[i];

            // Calculamos la diferencia de días entre 'compareDate' y 'completionDate'
            const diffTime = compareDate.getTime() - completionDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Es el mismo día. Sumamos 1 racha si es el primer elemento que evaluamos.
                if (streak === 0) streak = 1;
            } else if (diffDays === 1) {
                // Es exactamente el día anterior. ¡Racha continua!
                streak++;
                compareDate = completionDate; // Ahora compararemos con este día
            } else {
                // Hay un hueco de más de un día. La racha se rompe aquí.
                break;
            }
        }

        return streak;
    }
};
