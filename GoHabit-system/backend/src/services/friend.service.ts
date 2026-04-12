/**
 * ═══════════════════════════════════════════════════════════════
 * friend.service.ts — Servicio de amistades y comparación
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona el ciclo de vida de las amistades:
 *   1. Enviar solicitud (PENDING)
 *   2. Aceptar/rechazar (ACCEPTED/REJECTED)
 *   3. Eliminar amistad
 *   4. Comparar progreso entre amigos
 *
 * Las amistades son BIDIRECCIONALES: si A envía a B y B acepta,
 * ambos se ven en la lista del otro. Por eso usamos OR en las queries.
 */

import { friendRepository } from "@/repositories/friend.repository";
import { NotFoundError } from "@/lib/errors";

export const friendService = {
    /**
     * getFriends — Lista todos los amigos aceptados de un usuario.
     */
    async getFriends(userId: string) {
        return friendRepository.findFriends(userId);
    },

    /**
     * getPendingRequests — Lista todas las solicitudes pendientes recibidas.
     */
    async getPendingRequests(userId: string) {
        return friendRepository.findPendingRequests(userId);
    },

    /**
     * sendRequest — Envía una solicitud de amistad.
     */
    async sendRequest(senderId: string, receiverId: string) {
        if (senderId === receiverId) throw new Error('Cannot send a friend request to yourself');

        const existing = await friendRepository.findExistingRequest(senderId, receiverId);
        if (existing) throw new Error('Friend request already exists');

        await friendRepository.createRequest(senderId, receiverId);
        return { success: true };
    },

    /**
     * respondToRequest — Responde a una solicitud recibida (aceptar/rechazar).
     */
    async respondToRequest(friendshipId: string, userId: string, status: "ACCEPTED" | "REJECTED") {
        const friendship = await friendRepository.findPendingRequest(friendshipId, userId);
        if (!friendship) throw new NotFoundError("Friend request");

        await friendRepository.updateStatus(friendshipId, status);
        return { success: true };
    },

    /**
     * removeFriend — Elimina una amistad.
     */
    async removeFriend(friendshipId: string, userId: string) {
        const friendship = await friendRepository.findFriendship(friendshipId, userId);
        if (!friendship) throw new NotFoundError("Friendship");

        await friendRepository.deleteFriendship(friendshipId);
        return { success: true };
    },

    /**
     * compareProgress — Compara el progreso entre el usuario y un amigo.
     */
    async compareProgress(userId: string, friendId: string) {
        const [userProgress, friendProgress] = await Promise.all([
            this.getProgress(userId),
            this.getProgress(friendId),
        ]);
        return { user: userProgress, friend: friendProgress };
    },

    /**
     * getProgress — Helper interno para obtener el progreso resumido de un usuario.
     */
    async getProgress(userId: string) {
        const user = await friendRepository.getUserStats(userId);
        if (!user) throw new NotFoundError("User");

        const [habitsCompleted, tasksCompleted] = await Promise.all([
            friendRepository.countHabitCompletions(userId),
            friendRepository.countTasksCompleted(userId),
        ]);

        return {
            ...user,
            habitsCompleted,
            tasksCompleted
        };
    }
};
