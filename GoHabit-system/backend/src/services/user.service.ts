/**
 * ═══════════════════════════════════════════════════════════════
 * user.service.ts — Servicio de perfil de usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona la lectura y actualización del perfil de usuario.
 * Ofrece dos vistas: perfil PRIVADO (datos completos del propio usuario)
 * y perfil PÚBLICO (datos visibles para otros usuarios).
 */

import { userRepository } from "@/repositories/user.repository";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { TREE_STAGES, TREE_STAGE_LEVELS } from "@/lib/constants";

export const userService = {
    /**
     * getAll — Obtener lista de todos los usuarios (perfil público).
     */
    async getAll() {
        return userRepository.findAll();
    },

    async searchUsers(q: string, excludeUserId: string) {
        if (!q || q.length < 2) return [];
        return userRepository.searchByQuery(q, excludeUserId);
    },

    /**
     * getProfile — Perfil PRIVADO (todos los datos excepto password).
     * Solo accesible por el propio usuario (GET /api/users, GET /api/auth/me).
     */
    async getProfile(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw new NotFoundError('User');
        return user;
    },

    /**
     * getPublicProfile — Perfil PÚBLICO (datos limitados).
     * Accesible por cualquier usuario autenticado (GET /api/users/[userId]).
     * NO incluye email, monedas, ni datos sensibles.
     */
    async getPublicProfile(userId: string) {
        const user = await userRepository.findPublicById(userId);
        if (!user) throw new NotFoundError('User');
        return user;
    },

    /**
     * updateProfile — Actualiza el perfil del usuario autenticado.
     * Si cambia el username, verifica que no esté ya tomado.
     *
     * @throws ConflictError si el nuevo username ya está en uso por otro
     */
    async updateProfile(userId: string, data: any) {
        if (data.username) {
            const exists = await userRepository.existsOtherWithUsername(data.username, userId);
            if (exists) throw new ConflictError('Username already taken');
        }

        const keys = Object.keys(data);
        if (keys.length === 0) return this.getProfile(userId);

        await userRepository.update(userId, data);
        return this.getProfile(userId);
    },

    /**
     * addProgress — Actualiza puntos, monedas, nivel y etapa del árbol.
     * Se llama al completar hábitos o tareas.
     */
    async addProgress(userId: string, points: number, coins: number, connection?: any) {
        const user = await userRepository.findById(userId);
        if (!user) throw new NotFoundError('User');

        const updatedPoints = user.points + points;
        const updatedCoins = user.coins + coins;

        let currentLevel = 1;
        let xpTarget = 50;
        let remainingXp = updatedPoints;
        while (remainingXp >= xpTarget) {
            remainingXp -= xpTarget;
            currentLevel++;
            xpTarget += 50;
        }
        const newLevel = currentLevel;

        // Determinar la etapa del árbol basada en los puntos
        const newStage = TREE_STAGE_LEVELS.find(
            lvl => updatedPoints >= lvl.min && updatedPoints <= lvl.max
        )?.stage ?? 0;

        // Si se nos pasa una conexión, usamos esa (para transacciones), si no, usamos el pool normal
        if (connection) {
            await userRepository.updateStatsWithConnection(userId, updatedPoints, updatedCoins, newLevel, connection);
            await userRepository.updateTreeStage(userId, newStage); // Nota: updateTreeStage debería aceptar conexión también si queremos ser estrictos
        } else {
            await userRepository.updateStats(userId, updatedPoints, updatedCoins, newLevel);
            await userRepository.updateTreeStage(userId, newStage);
        }

        return {
            points: updatedPoints,
            coins: updatedCoins,
            level: newLevel,
            stage: newStage
        };
    },

    async getTreeStage(userId: string) {
        const stage = await userRepository.getTreeStage(userId);
        if (!stage) throw new NotFoundError('User or Avatar');
        return stage;
    }
};
