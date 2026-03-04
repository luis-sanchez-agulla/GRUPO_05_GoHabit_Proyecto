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

export const GAME_BALANCE = {
    LEVEP_EXP_BASE: 100,           // Multiplicador de dificultad para subir de nivel (nivel * LEVEP_EXP_BASE)
    STREAK_BONUS_MULTIPLIER: 0.2,  // Multiplicador para calcular el bonus de racha (días de racha * STREAK_BONUS_MULTIPLIER)
}

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

export const TREE_STAGE_LEVELS = [
    { min: 0, max: 10, stage: 0 },
    { min: 11, max: 30, stage: 1 },
    { min: 31, max: 60, stage: 2 },
    { min: 61, max: 100, stage: 3 },
    { min: 101, max: 150, stage: 4 },
    { min: 151, max: 210, stage: 5 },
    { min: 211, max: 280, stage: 6 },
    { min: 281, max: 360, stage: 7 },
    { min: 361, max: 450, stage: 8 },
    { min: 451, max: 500, stage: 9 },
    { min: 501, max: Infinity, stage: 10 },
];

export const TREE_STAGES = {
    0: "semilla",
    1: "brote",
    2: "arbolito",
    3: "arbol joven",
    4: "arbol maduro",
    5: "arbol especial",
    6: "arbol legendario",
    7: "arbol mítico",
    8: "arbol divino",
    9: "arbol celestial",
    10: "arbol cosmico",
};

