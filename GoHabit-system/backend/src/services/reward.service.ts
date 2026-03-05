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

import { pool } from "@/lib/mysql";
import { rewardRepository } from "@/repositories/reward.repository";
import { userRepository } from "@/repositories/user.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { randomInt } from "crypto";

export const rewardService = {
    /**
     * getAll — Devuelve todas las recompensas activas del catálogo.
     */
    async getAll() {
        return rewardRepository.findAllActive();
    },

    /**
     * getUserProgress — Obtiene el estado actual de progreso del usuario.
     */
    async getUserProgress(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw new NotFoundError('User not found');

        const stage = await userRepository.getTreeStage(userId);

        return {
            points: user.points,
            coins: user.coins,
            level: user.level,
            treeStage: stage?.etapa ?? 0
        };
    },


    /**
     * redeem — Canjea una recompensa gastando monedas del usuario.
     */
    async redeem(userId: string, rarity: string) {
        const user = await userRepository.findById(userId);
        if (!user) { throw new NotFoundError('Usuario no encontrado'); }

        const cost = await rewardRepository.getLootBoxCostByRarity(rarity);
        if (user.coins < cost) {
            throw new ValidationError('No tienes suficientes monedas para canjear esta recompensa');
        }

        const userAccessories = await userRepository.findUserAccessories(userId);
        const allAccessories = await rewardRepository.findAllActiveByRarity(rarity);

        // Filtrar accesorios que el usuario no posee
        const availableAccessories = allAccessories.filter(accessory =>
            !userAccessories.some(userAccessory => userAccessory.id === accessory.id)
        );

        if (availableAccessories.length === 0) {
            throw new ValidationError('No hay accesorios disponibles para canjear de esta rareza.');
        }

        // Seleccionar un accesorio aleatorio
        const randomIndex = randomInt(0, availableAccessories.length);
        const selectedAccessory = availableAccessories[randomIndex];

        // Iniciar transacción para el canje
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Restar monedas
            await userRepository.subtractCoins(userId, cost, connection);

            // 2. Añadir accesorio
            await userRepository.addAccessoryToUser(userId, selectedAccessory.id);

            await connection.commit();
            return selectedAccessory;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};

