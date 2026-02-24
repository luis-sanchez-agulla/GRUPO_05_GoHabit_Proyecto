/**
 * ═══════════════════════════════════════════════════════════════
 * admin.service.ts — Servicio de administración
 * ═══════════════════════════════════════════════════════════════
 *
 * Solo accesible por usuarios con role ADMIN (protegido por withRole).
 * Gestiona: listado de usuarios, cambio de roles, estadísticas
 * globales y CRUD de recompensas.
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export const adminService = {
    /**
     * getUsers — Lista todos los usuarios con paginación.
     *
     * @param page  - Número de página (empieza en 1)
     * @param limit - Usuarios por página (por defecto 20)
     *
     * Devuelve los usuarios + metadatos de paginación.
     * El frontend usa "meta" para mostrar controles de paginación.
     */
    async getUsers(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;  // Calcular cuántos saltar

        // Promise.all ejecuta AMBAS consultas en paralelo:
        // 1. Los usuarios de esta página
        // 2. El conteo total (para calcular totalPages)
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,             // Saltar los de páginas anteriores
                take: limit,      // Tomar solo "limit" usuarios
                select: {
                    id: true, email: true, username: true,
                    firstName: true, lastName: true,
                    role: true, points: true, level: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },  // Más recientes primero
            }),
            prisma.user.count(),  // Conteo total de usuarios
        ]);

        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),  // Redondear hacia arriba
            },
        };
    },

    /**
     * updateUserRole — Cambia el rol de un usuario (USER ↔ ADMIN).
     * Útil para promover usuarios a admin o degradarlos.
     */
    async updateUserRole(userId: string, role: "USER" | "ADMIN") {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundError("User");

        return prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, email: true, username: true, role: true },
        });
    },

    /**
     * getStats — Estadísticas globales del sistema.
     * Útil para un dashboard de administrador.
     */
    async getStats() {
        const [totalUsers, totalHabits, totalTasks, totalCompletions] = await Promise.all([
            prisma.user.count(),
            prisma.habit.count(),
            prisma.task.count(),
            prisma.habitCompletion.count(),
        ]);

        return { totalUsers, totalHabits, totalTasks, totalCompletions };
    },

    // ── Gestión de recompensas (solo admin) ──────────

    /** createReward — Crea una nueva recompensa en el catálogo. */
    async createReward(data: { name: string; description?: string; cost: number; icon?: string }) {
        return prisma.reward.create({ data });
    },

    /** updateReward — Actualiza una recompensa existente. */
    async updateReward(rewardId: string, data: { name?: string; description?: string; cost?: number; icon?: string; isActive?: boolean }) {
        const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward) throw new NotFoundError("Reward");
        return prisma.reward.update({ where: { id: rewardId }, data });
    },

    /** deleteReward — Elimina una recompensa del catálogo. */
    async deleteReward(rewardId: string) {
        const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward) throw new NotFoundError("Reward");
        return prisma.reward.delete({ where: { id: rewardId } });
    },
};
