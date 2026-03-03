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

import { query, execute } from "@/lib/mysql";
import { NotFoundError } from "@/lib/errors";

export const friendService = {
    /**
     * getFriends — Lista todos los amigos aceptados de un usuario.
     */
    async getFriends(userId: string) {
        const [friendships]: any = await query(
            `SELECT * FROM friendships 
             WHERE status = 'ACCEPTED' AND (senderId = ? OR receiverId = ?)`,
            [userId, userId]
        );

        const friendIds = friendships.map((f: any) => f.senderId === userId ? f.receiverId : f.senderId);

        if (friendIds.length === 0) return [];

        const [friendDetails]: any = await query(
            `SELECT id, username, firstName, lastName, avatarUrl, level, points 
             FROM users WHERE id IN (?)`,
            [friendIds]
        );

        return friendDetails;
    },

    /**
     * sendRequest — Envía una solicitud de amistad.
     */
    async sendRequest(senderId: string, receiverId: string) {
        if (senderId === receiverId) throw new Error('Cannot send a friend request to yourself');

        const [existing]: any = await query(
            `SELECT id FROM friendships 
             WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)`,
            [senderId, receiverId, receiverId, senderId]
        );

        if (existing && existing.length > 0) throw new Error('Friend request already exists');

        await execute(
            'INSERT INTO friendships (senderId, receiverId, status) VALUES (?, ?, ?)',
            [senderId, receiverId, 'PENDING']
        );

        return { success: true };
    },

    /**
     * respondToRequest — Responde a una solicitud recibida (aceptar/rechazar).
     */
    async respondToRequest(friendshipId: string, userId: string, status: "ACCEPTED" | "REJECTED") {
        const [rows]: any = await query(
            "SELECT id FROM friendships WHERE id = ? AND receiverId = ? AND status = ?",
            [friendshipId, userId, "PENDING"]
        );
        if (!rows || rows.length === 0) throw new NotFoundError("Friend request");

        await execute(
            "UPDATE friendships SET status = ? WHERE id = ?",
            [status, friendshipId]
        );
        return { success: true };
    },

    /**
     * removeFriend — Elimina una amistad.
     */
    async removeFriend(friendshipId: string, userId: string) {
        const [rows]: any = await query(
            "SELECT id FROM friendships WHERE id = ? AND (senderId = ? OR receiverId = ?)",
            [friendshipId, userId, userId]
        );
        if (!rows || rows.length === 0) throw new NotFoundError("Friendship");

        await execute("DELETE FROM friendships WHERE id = ?", [friendshipId]);
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
        const [rows]: any = await query(
            'SELECT id, username, points, coins, level FROM users WHERE id = ?',
            [userId]
        );
        if (!rows || rows.length === 0) throw new NotFoundError("User");
        const user = rows[0];

        const [habitsCompletedResult, tasksCompletedResult]: any = await Promise.all([
            query("SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?", [userId]),
            query("SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?", [userId, "COMPLETED"]),
        ]);

        return {
            ...user,
            habitsCompleted: habitsCompletedResult[0][0].count,
            tasksCompleted: tasksCompletedResult[0][0].count
        };
    }
};
