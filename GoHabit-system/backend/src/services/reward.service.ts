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
     * redeem — Canjea una recompensa gastando monedas del usuario.
     */
    async redeem(userId: string, rarity: string) {
        const user = await userRepository.findById(userId);
        if (!user) { throw new NotFoundError('Usuario no encontrado'); }

        const costeLootBox = await rewardRepository.getLootBoxCostByRarity(rarity);
        if (user.points < costeLootBox) {
            throw new ValidationError('No tienes suficientes monedas para canjear esta recompensa');
        }

        

        const userAccessories = await userRepository.findUserAccessories(userId);
        const allAccessories = await rewardRepository.findAllActiveByRarity(rarity);

        // Filtrar accesorios que el usuario no posee
        const availableAccessories = allAccessories.filter(accessory => 
            !userAccessories.some(userAccessory => userAccessory.id === accessory.id)
        );

        if (availableAccessories.length === 0) {
            throw new ValidationError('No hay accesorios disponibles para canjear.');
        }

        // Seleccionar un accesorio aleatorio
        const randomIndex = randomInt(0, availableAccessories.length);
        const selectedAccessory = availableAccessories[randomIndex];

        user.points -= costeLootBox;

        userRepository.update(userId, { points: user.points });
        userRepository.addAccessoryToUser(userId, selectedAccessory.id);

        return selectedAccessory;
    },
};

