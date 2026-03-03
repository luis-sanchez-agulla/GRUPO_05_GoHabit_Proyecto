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

export const userService = {
    /**
     * getAll — Obtener lista de todos los usuarios (perfil público).
     */
    async getAll() {
        return userRepository.findAll();
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
    * setXpAndCoins — Método interno para actualizar puntos, monedas y nivel del usuario.
    * Se llama desde el servicio de tareas al completar una tarea.
    */
    async setXpAndCoins(userId: string, points: number, coins: number) {
        const user = await userRepository.findById(userId);
        if (!user) throw new NotFoundError('User');

        const updatedPoints = user.points + points;
        const updatedCoins = user.coins + coins;
        const newLevel = Math.floor(Math.sqrt(updatedPoints / 100));

        await userRepository.updateStats(
            userId,
            updatedPoints,
            updatedCoins,
            Math.max(newLevel, user.level)
        );

        return userRepository.findById(userId);
    },
};
