import { query, execute } from "@/lib/mysql";
import { Habit } from "@/entities/habit.entity";

export const habitRepository = {
    async findById(id: string): Promise<Habit | null> {
        const [rows]: any = await query(
            'SELECT * FROM habits WHERE id = ?',
            [id]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findAllByUserId(userId: string): Promise<Habit[]> {
        const [rows]: any = await query(
            'SELECT * FROM habits WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        return rows || [];
    },


    async findCompletions(habitId: string, limit: number = 10): Promise<any[]> {
        const [rows]: any = await query(
            'SELECT * FROM habit_completions WHERE habitId = ? ORDER BY completedAt DESC LIMIT ?',
            [habitId, limit]
        );
        return rows || [];
    },

    async findCompletionById(id: number): Promise<any | null> {
        const [rows]: any = await query('SELECT * FROM habit_completions WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },


    async findCompletionDates(habitId: string, userId: string): Promise<Date[]> {
        const [rows]: any = await query(
            `SELECT DISTINCT DATE(completedAt) as fecha
             FROM habit_completions
             WHERE habitId = ? AND userId = ?
             ORDER BY fecha ASC`,
            [habitId, userId]
        );
        return rows.map((row: any) => {
            const d = new Date(row.fecha);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    },

    async countHabitCompletions(userId: string): Promise<number> {
        const [rows]: any = await query(
            "SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?",
            [userId]
        );
        return rows[0].count;
    },

    async create(userId: string, data: any): Promise<number> {
        const [result]: any = await execute(
            'INSERT INTO habits (userId, title, description, frequency, targetCount, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, data.title, data.description || null, data.frequency || 'DAILY', data.targetCount || 1, data.color || '#6366f1', data.icon || 'star']
        );
        return result.insertId;
    },

    async createCompletion(habitId: string, userId: string, note?: string, connection?: any): Promise<number> {
        const sql = 'INSERT INTO habit_completions (habitId, userId, note) VALUES (?, ?, ?)';
        const params = [habitId, userId, note || null];

        if (connection) {
            const [result]: any = await connection.execute(sql, params);
            return result.insertId;
        } else {
            const [result]: any = await execute(sql, params);
            return result.insertId;
        }
    },

    async updateUserStats(userId: string, points: number, coins: number, connection: any): Promise<void> {
        await connection.execute(
            'UPDATE users SET points = points + ?, coins = coins + ? WHERE id = ?',
            [points, coins, userId]
        );
    },

    async updateUserStreak(userId: string, streak: number): Promise<void> {
        await execute(
            'UPDATE users SET streak = ? WHERE id = ?',
            [streak, userId]
        );
    },

    async update(id: string, userId: string, data: any): Promise<void> {

        const ALLOWED_COLUMNS = new Set([
            'title', 'description', 'frequency',
            'targetCount', 'color', 'icon', 'isActive',
        ]);

        const allowed = Object.keys(data).filter(key => ALLOWED_COLUMNS.has(key));
        if (allowed.length === 0) return;

        const setClause = allowed.map(key => `${key} = ?`).join(', ');
        const values    = allowed.map(key => data[key]);

        await execute(
            `UPDATE habits SET ${setClause} WHERE id = ? AND userId = ?`,
            [...values, id, userId]
        );
    },

    async delete(id: string, userId: string): Promise<void> {
        await execute(
            'DELETE FROM habits WHERE id = ? AND userId = ?',
            [id, userId]
        );
    },
};
