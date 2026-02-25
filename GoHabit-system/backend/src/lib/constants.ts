/**
 * ═══════════════════════════════════════════════════════════════
 * constants.ts — Constantes globales de la aplicación
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Para qué sirve?
 * Centraliza todos los valores "mágicos" (números y strings fijos)
 * en un solo lugar. Así, si queremos cambiar cuántos puntos se dan
 * por completar un hábito, solo hay que modificar este archivo.
 *
 * "as const" al final congela el objeto: TypeScript lo trata como
 * valores literales inmutables, no como tipos genéricos (number/string).
 */

/**
 * POINTS — Puntos otorgados por cada acción del usuario.
 * Los puntos representan el progreso general del usuario.
 * Al acumular suficientes puntos, el usuario sube de nivel.
 */
export const POINTS = {
    HABIT_COMPLETION: 10,        // Puntos por completar un hábito una vez
    TASK_COMPLETION: 15,         // Puntos por completar una tarea
    STREAK_BONUS: 5,             // Puntos extra por cada día consecutivo de racha
    LEVEL_UP_THRESHOLD: 100,     // Puntos necesarios para subir de nivel
} as const;

/**
 * COINS — Monedas otorgadas por cada acción.
 * Las monedas son la "divisa" del sistema de recompensas.
 * El usuario las gasta para canjear recompensas en /api/rewards/redeem.
 */
export const COINS = {
    HABIT_COMPLETION: 5,         // Monedas por completar un hábito
    TASK_COMPLETION: 10,         // Monedas por completar una tarea
    LEVEL_UP_BONUS: 25,          // Monedas extra al subir de nivel
} as const;

/**
 * LIMITS — Límites del sistema para prevenir abuso.
 * Establece máximos razonables para proteger la base de datos.
 */
export const LIMITS = {
    MAX_HABITS_PER_USER: 50,     // Máximo de hábitos que puede tener un usuario
    MAX_TASKS_PER_USER: 200,     // Máximo de tareas activas por usuario
    MAX_FRIENDS: 100,            // Máximo de amigos por usuario
    PASSWORD_MIN_LENGTH: 8,      // Mínimo de caracteres para contraseñas
    USERNAME_MIN_LENGTH: 3,      // Mínimo de caracteres para nombre de usuario
    USERNAME_MAX_LENGTH: 30,     // Máximo de caracteres para nombre de usuario
} as const;

/**
 * ROLES — Roles disponibles en el sistema.
 * USER:  usuario normal (puede gestionar sus propios datos)
 * ADMIN: administrador (puede gestionar usuarios y recompensas globales)
 */
export const ROLES = {
    USER: "USER",
    ADMIN: "ADMIN",
} as const;
