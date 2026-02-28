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

import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

export const rewardService = {
    /**
     * getAll — Devuelve todas las recompensas activas del catálogo.
     * Ordenadas por coste (más baratas primero).
     * No requiere autenticación.
     */
    async getAll() {
        return prisma.reward.findMany({
            where: { isActive: true },     // Solo recompensas activas (visibles)
            orderBy: { cost: "asc" },      // Ordenar: baratas primero
        });
    },

    /**
     * redeem — Canjea una recompensa gastando monedas del usuario.
     *
     * Flujo:
     *   1. Verificar que la recompensa existe y está activa
     *   2. Verificar que el usuario tiene suficientes monedas
     *   3. En una transacción:
     *      a. Crear registro en user_rewards (se canjeó)
     *      b. Restar las monedas del usuario
     *
     * @throws NotFoundError si la recompensa no existe
     * @throws ValidationError si no tiene suficientes monedas
     */
    async redeem(userId: string, rewardId: string) {
        // 1. Buscar la recompensa
        const reward = await prisma.reward.findFirst({
            where: { id: rewardId, isActive: true },
        });
        if (!reward) throw new NotFoundError("Reward");

        // 2. Verificar saldo de monedas
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true },
        });
        if (!user || user.coins < reward.cost) {
            throw new ValidationError("Insufficient coins");
        }

        // 3. Transacción: registrar canje + restar monedas
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Crear registro de canje
            const userReward = await tx.userReward.create({
                data: { userId, rewardId },
            });

            // Restar monedas: { decrement: N } resta N del valor actual
            await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: reward.cost } },
            });

            return userReward;
        });
    },

    /**
     * getUserProgress — Devuelve un resumen del progreso del usuario.
     * Combina datos del modelo User con conteos de la BD.
     *
     * Respuesta ejemplo:
     *   { points: 250, coins: 80, level: 3, habitsCompleted: 25, tasksCompleted: 12, currentStreak: 5 }
     */
    async getUserProgress(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true, coins: true, level: true },
        });
        if (!user) throw new NotFoundError("User");

        // Promise.all ejecuta ambas consultas EN PARALELO (más rápido)
        const [habitsCompleted, tasksCompleted] = await Promise.all([
            prisma.habitCompletion.count({ where: { userId } }),
            prisma.task.count({ where: { userId, status: "COMPLETED" } }),
        ]);

        return {
            ...user,
            habitsCompleted,
            tasksCompleted,
            currentStreak: 0,  // TODO: Implementar cálculo de racha real
        };
    },
};
