/**
 * ═══════════════════════════════════════════════════════════════
 * auth.service.ts — Servicio de autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué es un "servicio"?
 * Es donde vive la LÓGICA DE NEGOCIO. Los route handlers (controllers)
 * solo se encargan de recibir la petición HTTP y devolver la respuesta.
 * Todo lo "inteligente" (consultar BD, hashear contraseñas, generar
 * tokens) se hace aquí.
 *
 * ¿Por qué separar services de routes?
 * 1. Testabilidad: puedes probar la lógica sin HTTP
 * 2. Reutilización: varios endpoints pueden usar el mismo servicio
 * 3. Claridad: cada archivo tiene UNA responsabilidad
 *
 * Este servicio gestiona: registro, login y consulta de perfil.
 */

import { query, execute } from "@/lib/mysql";          // Cliente de base de datos
import { signToken } from "@/lib/auth";           // Genera tokens JWT
import { ConflictError, UnauthorizedError, NotFoundError } from "@/lib/errors";  // Errores tipados
import bcrypt from "bcryptjs";                    // Hashing de contraseñas
import type { LoginInput, RegisterInput } from "@/validations/auth.schema";

// Rondas de hashing para bcrypt (más rondas = más seguro pero más lento)
const SALT_ROUNDS = 10;

export const authService = {
    /**
     * register — Registra un nuevo usuario en el sistema.
     *
     * Flujo:
     *   1. Verifica que el email y username no estén ya en uso
     *   2. Hashea la contraseña con bcrypt (NUNCA guardamos texto plano)
     *   3. Crea el usuario en la BD
     *   4. Genera un token JWT para que pueda autenticarse inmediatamente
     *   5. Devuelve los datos del usuario (sin password) + token
     *
     * @throws ConflictError si el email o username ya existen
     */
    async register(input: RegisterInput) {
        // Buscar si ya existe un usuario con ese email O username
        const [existing]: any = await query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [input.email, input.username]
        );

        if (existing && existing.length > 0) {
            throw new ConflictError("Email or username already exists");
        }

        // Hashear la contraseña: "password123" → "$2a$10$X7sKz..."
        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

        // Crear el usuario en MySQL
        const [result]: any = await execute(
            'INSERT INTO users (email, username, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
            [input.email, input.username, hashedPassword, input.firstName, input.lastName]
        );

        const userId = result.insertId;

        const [userRows]: any = await query(
            'SELECT id, email, username, role FROM users WHERE id = ?',
            [userId]
        );
        const user = userRows[0];

        // Generar token JWT para autenticación inmediata
        const token = signToken(user.id, user.role);
        return { user, token };
    },

    /**
     * login — Autentica un usuario con email y contraseña.
     *
     * Flujo:
     *   1. Busca el usuario por email
     *   2. Compara la contraseña enviada con el hash almacenado (bcrypt.compare)
     *   3. Si coinciden, genera un JWT
     *   4. Devuelve usuario (sin password) + token
     *
     * @throws UnauthorizedError si email no existe o contraseña incorrecta
     *         (mensaje genérico para no revelar si el email existe)
     */
    async login(input: LoginInput) {
        // Buscar usuario por email (incluimos password para comparar)
        const [rows]: any = await query(
            'SELECT id, email, username, role, password FROM users WHERE email = ?',
            [input.email]
        );
        const user = rows[0];

        // Verificar: ¿existe el usuario? ¿la contraseña coincide con el hash?
        if (!user || !(await bcrypt.compare(input.password, user.password))) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // Generar token JWT
        const token = signToken(user.id, user.role);

        // Quitar el password del objeto antes de devolverlo al cliente
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    },

    /**
     * getMe — Obtiene el perfil completo del usuario autenticado.
     * Se llama desde GET /api/auth/me con el ID extraído del JWT.
     */
    async getMe(userId: string) {
        const [rows]: any = await query(
            'SELECT id, email, username, firstName, lastName, avatarUrl, role, points, coins, level, createdAt FROM users WHERE id = ?',
            [userId]
        );

        if (!rows || rows.length === 0) throw new NotFoundError('User');

        return rows[0];
    },
};
