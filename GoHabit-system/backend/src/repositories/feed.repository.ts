import { query } from "@/lib/mysql";

export const feedRepository = {
    /**
     * Obtiene los hábitos completados por los amigos del usuario.
     */
    async getFriendFeed(userId: string, limit: number = 20): Promise<any[]> {
        const sql = `
            SELECT 
                hc.id AS completionId,
                hc.note,
                hc.imageUrl,
                hc.completedAt,
                h.title AS habitTitle,
                h.color AS habitColor,
                h.icon AS habitIcon,
                u.id AS friendId,
                u.username AS friendUsername,
                u.avatar_url AS friendAvatar
            FROM habit_completions hc
            JOIN habits h ON hc.habitId = h.id
            JOIN users u ON hc.userId = u.id
            LEFT JOIN friendships f ON (
                (f.senderId = ? AND f.receiverId = u.id) OR 
                (f.receiverId = ? AND f.senderId = u.id)
            )
            WHERE (f.status = 'ACCEPTED' OR u.id = ?)
              AND hc.imageUrl IS NOT NULL
            ORDER BY hc.completedAt DESC
            LIMIT ?
        `;
        
        const [rows]: any = await query(sql, [userId, userId, userId, limit]);
        return rows || [];
    }
};
