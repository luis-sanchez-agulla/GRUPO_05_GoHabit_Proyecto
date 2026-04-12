import { query, execute } from "@/lib/mysql";

export const friendRepository = {
    async findFriends(userId: string): Promise<any[]> {
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

    async findExistingRequest(senderId: string, receiverId: string): Promise<any | null> {
        const [rows]: any = await query(
            `SELECT id FROM friendships 
             WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)`,
            [senderId, receiverId, receiverId, senderId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async createRequest(senderId: string, receiverId: string): Promise<void> {
        await execute(
            'INSERT INTO friendships (senderId, receiverId, status) VALUES (?, ?, ?)',
            [senderId, receiverId, 'PENDING']
        );
    },

    async findPendingRequest(id: string, receiverId: string): Promise<any | null> {
        const [rows]: any = await query(
            "SELECT id FROM friendships WHERE id = ? AND receiverId = ? AND status = ?",
            [id, receiverId, "PENDING"]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findPendingRequests(userId: string): Promise<any[]> {
        const [rows]: any = await query(
            `SELECT f.id, f.senderId, f.createdAt, u.username as sender_username, u.avatarUrl as avatar_url
             FROM friendships f
             JOIN users u ON f.senderId = u.id
             WHERE f.receiverId = ? AND f.status = 'PENDING'`,
            [userId]
        );
        return rows;
    },

    async updateStatus(id: string, status: string): Promise<void> {
        await execute(
            "UPDATE friendships SET status = ? WHERE id = ?",
            [status, id]
        );
    },

    async findFriendship(id: string, userId: string): Promise<any | null> {
        const [rows]: any = await query(
            "SELECT id FROM friendships WHERE id = ? AND (senderId = ? OR receiverId = ?)",
            [id, userId, userId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async deleteFriendship(id: string): Promise<void> {
        await execute("DELETE FROM friendships WHERE id = ?", [id]);
    },

    async getUserStats(userId: string): Promise<any | null> {
        const [rows]: any = await query(
            'SELECT id, username, points, coins, level FROM users WHERE id = ?',
            [userId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async countHabitCompletions(userId: string): Promise<number> {
        const [rows]: any = await query(
            "SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?",
            [userId]
        );
        return rows[0].count;
    },

    async countTasksCompleted(userId: string): Promise<number> {
        const [rows]: any = await query(
            "SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?",
            [userId, "COMPLETED"]
        );
        return rows[0].count;
    }
};
