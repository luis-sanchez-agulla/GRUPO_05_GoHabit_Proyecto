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

        const userPets = await userRepository.findUserAccessories(userId);
        const allPets = await rewardRepository.findAllActiveByRarity(rarity);

        // Filtrar mascotas que el usuario no posee
        const availablePets = allPets.filter(pet =>
            !userPets.some(userPet => userPet.id === pet.id)
        );

        if (availablePets.length === 0) {
            throw new ValidationError('No hay mascotas disponibles para canjear de esta rareza.');
        }

        // Seleccionar una mascota aleatoria
        const randomIndex = randomInt(0, availablePets.length);
        const selectedPet = availablePets[randomIndex];

        // Iniciar transacción para el canje
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Restar monedas
            await userRepository.subtractCoins(userId, cost, connection);

            // 2. Añadir accesorio
            await userRepository.addAccessoryToUser(userId, selectedPet.id);

            await connection.commit();
            return selectedPet;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};

