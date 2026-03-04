import { query, execute } from "@/lib/mysql";
import { UserPrivateProfile, UserPublicProfile } from "@/entities/user.entity";

export const userRepository = {
    async findAll(): Promise<UserPublicProfile[]> {
        const [rows]: any = await query(
            'SELECT id, username, firstName, lastName, avatarUrl, level, points FROM users'
        );
        return rows || [];
    },

    async findById(id: string): Promise<UserPrivateProfile | null> {
        const [rows]: any = await query(
            'SELECT id, email, username, firstName, lastName, avatarUrl, role, points, coins, level, createdAt FROM users WHERE id = ?',
            [id]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findPublicById(id: string): Promise<UserPublicProfile | null> {
        const [rows]: any = await query(
            'SELECT id, username, firstName, lastName, avatarUrl, level, points FROM users WHERE id = ?',
            [id]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findByEmailOrUsername(email: string, username: string): Promise<any | null> {
        const [rows]: any = await query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findByEmailWithPassword(email: string): Promise<any | null> {
        const [rows]: any = await query(
            'SELECT id, email, username, role, password FROM users WHERE email = ?',
            [email]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async existsOtherWithUsername(username: string, userId: string): Promise<boolean> {
        const [rows]: any = await query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );
        return rows && rows.length > 0;
    },

    async create(data: any): Promise<number> {
        const [result]: any = await execute(
            'INSERT INTO users (email, username, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
            [data.email, data.username, data.password, data.firstName, data.lastName]
        );
        return result.insertId;
    },

    async update(userId: string, data: any): Promise<void> {
        const keys = Object.keys(data);
        if (keys.length === 0) return;

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        await execute(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            [...values, userId]
        );
    },

    async updateStats(userId: string, points: number, coins: number, level: number): Promise<void> {
        await execute(
            'UPDATE users SET points = ?, coins = ?, level = ? WHERE id = ?',
            [points, coins, level, userId]
        );
    },

    async getTreeStage(userId: string): Promise<any> {
        const [rows]: any = await query(
            'SELECT etapa FROM Avatar WHERE usuario_id = ?',
            [userId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async updateTreeStage(userId: string, newStage: number): Promise<void> {
        await execute(
            'UPDATE Avatar SET etapa = ? WHERE usuario_id = ?',
            [newStage, userId]
        );
    }
};
