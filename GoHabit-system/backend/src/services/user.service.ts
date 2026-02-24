/**
 * ═══════════════════════════════════════════════════════════════
 * user.service.ts — Servicio de perfil de usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona la lectura y actualización del perfil de usuario.
 * Ofrece dos vistas: perfil PRIVADO (datos completos del propio usuario)
 * y perfil PÚBLICO (datos visibles para otros usuarios).
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import type { UpdateProfileInput } from "@/validations/user.schema";

export const userService = {
    /**
     * getProfile — Perfil PRIVADO (todos los datos excepto password).
     * Solo accesible por el propio usuario (GET /api/users, GET /api/auth/me).
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, username: true,
                firstName: true, lastName: true, avatarUrl: true,
                role: true, points: true, coins: true, level: true,
                createdAt: true,
                // password NUNCA se incluye
            },
        });
        if (!user) throw new NotFoundError("User");
        return user;
    },

    /**
     * getPublicProfile — Perfil PÚBLICO (datos limitados).
     * Accesible por cualquier usuario autenticado (GET /api/users/[userId]).
     * NO incluye email, monedas, ni datos sensibles.
     */
    async getPublicProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, username: true,
                firstName: true, lastName: true, avatarUrl: true,
                level: true, points: true,
                // Sin email, coins, role, createdAt
            },
        });
        if (!user) throw new NotFoundError("User");
        return user;
    },

    /**
     * updateProfile — Actualiza el perfil del usuario autenticado.
     * Si cambia el username, verifica que no esté ya tomado.
     *
     * @throws ConflictError si el nuevo username ya está en uso por otro
     */
    async updateProfile(userId: string, data: UpdateProfileInput) {
        // Si intenta cambiar el username, verificar unicidad
        if (data.username) {
            const existing = await prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT: { id: userId },  // Excluir al propio usuario
                },
            });
            if (existing) throw new ConflictError("Username already taken");
        }

        return prisma.user.update({
            where: { id: userId },
            data,  // Solo actualiza los campos proporcionados
            select: {
                id: true, email: true, username: true,
                firstName: true, lastName: true, avatarUrl: true,
            },
        });
    },
};
