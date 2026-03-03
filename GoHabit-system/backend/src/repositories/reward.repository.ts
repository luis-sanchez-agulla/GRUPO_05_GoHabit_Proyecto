import { query, execute } from "@/lib/mysql";
import { Reward } from "@/entities/reward.entity";

export const rewardRepository = {
    async findAllActive(): Promise<Reward[]> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE isActive = 1 ORDER BY cost ASC');
        return rows || [];
    },

    async findById(id: string): Promise<Reward | null> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async getUserCoins(userId: string): Promise<number> {
        const [rows]: any = await query('SELECT coins FROM users WHERE id = ?', [userId]);
        return rows && rows.length > 0 ? rows[0].coins : 0;
    },

    async createRedemption(userId: string, rewardId: string, connection: any): Promise<void> {
        await connection.execute(
            'INSERT INTO user_rewards (userId, rewardId) VALUES (?, ?)',
            [userId, rewardId]
        );
    },

    async subtractCoins(userId: string, amount: number, connection: any): Promise<void> {
        await connection.execute(
            'UPDATE users SET coins = coins - ? WHERE id = ?',
            [amount, userId]
        );
    },

    async getUserStats(userId: string): Promise<any | null> {
        const [rows]: any = await query(
            "SELECT points, coins, level FROM users WHERE id = ?",
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
