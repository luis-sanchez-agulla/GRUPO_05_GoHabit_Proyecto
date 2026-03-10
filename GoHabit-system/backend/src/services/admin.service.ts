/**
 * ═══════════════════════════════════════════════════════════════
 * admin.service.ts — Servicio de administración
 * ═══════════════════════════════════════════════════════════════
 *
 * Solo accesible por usuarios con role ADMIN (protegido por withRole).
 * Gestiona: listado de usuarios, cambio de roles, estadísticas
 * globales y CRUD de recompensas.
 */

import { adminRepository } from "@/repositories/admin.repository";
import { NotFoundError } from "@/lib/errors";

export const adminService = {
    /**
     * getUsers — Lista todos los usuarios con paginación.
     *
     * @param page  - Número de página (empieza en 1)
     * @param limit - Usuarios por página (por defecto 20)
     *
     * Devuelve los usuarios + metadatos de paginación.
     */
    async getUsers(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const users = await adminRepository.findUsers(limit, offset);
        const total = await adminRepository.countUsers();

        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * updateUserRole — Cambia el rol de un usuario (USER ↔ ADMIN).
     */
    async updateUserRole(userId: string, role: "USER" | "ADMIN") {
        const user = await adminRepository.findUserById(userId);
        if (!user) throw new NotFoundError("User");

        await adminRepository.updateUserRole(userId, role);

        return adminRepository.findUserById(userId);
    },

    /**
     * getStats — Estadísticas globales del sistema.
     */
    async getStats() {
        return adminRepository.getSystemStats();
    },

    // ── Gestión de recompensas (solo admin) ──────────

    async createReward(data: { name: string; description?: string; cost: number; icon?: string }) {
        const rewardId = await adminRepository.createReward(data);
        return adminRepository.findRewardById(rewardId.toString());
    },

    /** updateReward — Actualiza una recompensa existente. */
    async updateReward(rewardId: string, data: { name?: string; description?: string; cost?: number; icon?: string; isActive?: boolean }) {
        const existing = await adminRepository.findRewardById(rewardId);
        if (!existing) throw new NotFoundError("Reward");

        if (Object.keys(data).length === 0) return existing;

        await adminRepository.updateReward(rewardId, data);
        return adminRepository.findRewardById(rewardId);
    },

    /** deleteReward — Elimina una recompensa del catálogo. */
    async deleteReward(rewardId: string) {
        const existing = await adminRepository.findRewardById(rewardId);
        if (!existing) throw new NotFoundError("Reward");

        await adminRepository.deleteReward(rewardId);
        return { id: rewardId, deleted: true };
    },
};
