import { query, execute } from "@/lib/mysql";
import { UserPrivateProfile, UserPublicProfile } from "@/entities/user.entity";
import { randomUUID } from "crypto";

export const userRepository = {
    async findAll(): Promise<UserPublicProfile[]> {
        const [rows]: any = await query(
            'SELECT id, username, first_name AS firstName, last_name AS lastName, avatar_url AS avatarUrl, level, points FROM users'
        );
        return rows || [];
    },

    async findById(id: string): Promise<UserPrivateProfile | null> {
        const [rows]: any = await query(
            'SELECT id, email, username, first_name AS firstName, last_name AS lastName, avatar_url AS avatarUrl, role, points, coins, level, created_at AS createdAt FROM users WHERE id = ?',
            [id]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findPublicById(id: string): Promise<UserPublicProfile | null> {
        const [rows]: any = await query(
            'SELECT id, username, first_name AS firstName, last_name AS lastName, avatar_url AS avatarUrl, level, points FROM users WHERE id = ?',
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

    async create(data: any): Promise<string> {
        const userId = randomUUID();
        await execute(
            'INSERT INTO users (id, email, username, password, first_name, last_name, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(3))',
            [userId, data.email, data.username, data.password, data.firstName, data.lastName]
        );
        return userId;
    },

    async update(userId: string, data: any): Promise<void> {

        const fieldMap: Record<string, string> = {
            firstName:  'first_name',
            lastName:   'last_name',
            avatarUrl:  'avatar_url',
            username:   'username',
        };

        const allowed = Object.keys(data).filter((key) => key in fieldMap);
        if (allowed.length === 0) return;

        const setClause = allowed.map((key) => `${fieldMap[key]} = ?`).join(', ');
        const values    = allowed.map((key) => data[key]);

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

    async updateStatsWithConnection(userId: string, points: number, coins: number, level: number, connection: any): Promise<void> {
        await connection.execute(
            'UPDATE users SET points = ?, coins = ?, level = ? WHERE id = ?',
            [points, coins, level, userId]
        );
    },

    async getUserStats(userId: string): Promise<any | null> {
        const [rows]: any = await query(
            "SELECT points, coins, level FROM users WHERE id = ?",
            [userId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findUserAccessories(userId: string): Promise<any[]> {
        const [rows]: any = await query(`SELECT id FROM Accesorio AS a INNER JOIN Avatar_Accesorio AS aa ON a.id = aa.accesorioId WHERE aa.userId = ?`, [userId]);
        return rows || [];
    },

    async addAccessoryToUser(userId: string, accessoryId: string): Promise<void> {
        await execute(
            'INSERT INTO Avatar_Accesorio (userId, accesorioId) VALUES (?, ?)',
            [userId, accessoryId]
        );
    },

    async getUserCoins(userId: string): Promise<number> {
        const [rows]: any = await query('SELECT coins FROM users WHERE id = ?', [userId]);
        return rows && rows.length > 0 ? rows[0].coins : 0;
    },

    async subtractCoins(userId: string, amount: number, connection: any): Promise<void> {
        await connection.execute(
            'UPDATE users SET coins = coins - ? WHERE id = ?',
            [amount, userId]
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
