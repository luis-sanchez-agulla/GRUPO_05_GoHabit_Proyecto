/**
 * ═══════════════════════════════════════════════════════════════
 * domain.d.ts — Tipos de dominio (DTOs y entidades de negocio)
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué son los tipos de dominio?
 * Son interfaces TypeScript que representan los objetos del negocio
 * (hábitos, tareas, usuarios, etc.) de forma LIMPIA y desacoplada
 * de Prisma. Se usan para:
 *   - Tipar las respuestas API (qué ve el cliente)
 *   - Tipar los datos de entrada (qué envía el cliente)
 *   - Definir contratos entre servicios
 *
 * ¿Por qué no usar directamente los tipos de Prisma?
 * Los modelos de Prisma incluyen campos internos (password, etc.)
 * que NO queremos exponer al cliente. Estos DTOs (Data Transfer Objects)
 * contienen solo los campos que deben ser visibles.
 */

// ─── User ──────────────────────────────────────────

/**
 * UserPublicProfile — Datos visibles para OTROS usuarios.
 * Se devuelve en /api/users/[userId] y en listas de amigos.
 * NO incluye email, monedas ni datos sensibles.
 */
export interface UserPublicProfile {
    id: string;
    username: string;
    firstName: string | null;   // null si el usuario no lo ha rellenado
    lastName: string | null;
    avatarUrl: string | null;
    level: number;
    points: number;
}

/**
 * UserPrivateProfile — Datos visibles solo para el PROPIO usuario.
 * Extiende el perfil público añadiendo email, rol y monedas.
 * Se devuelve en /api/auth/me y /api/users (perfil propio).
 */
export interface UserPrivateProfile extends UserPublicProfile {
    email: string;
    role: string;
    coins: number;
    createdAt: Date;
}

// ─── Habit ─────────────────────────────────────────

/**
 * HabitCreateInput — Datos que el cliente envía para CREAR un hábito.
 * Solo los campos que el usuario puede definir (no id, no userId, no fechas).
 */
export interface HabitCreateInput {
    title: string;
    description?: string;
    frequency?: "DAILY" | "WEEKLY" | "MONTHLY";  // Con qué frecuencia hay que completarlo
    targetCount?: number;                         // Veces que hay que hacerlo por período
    color?: string;                               // Color hex para la UI (ej: "#6366f1")
    icon?: string;                                // Icono de la UI (ej: "star")
}

/** HabitUpdateInput — Datos para ACTUALIZAR un hábito (todos opcionales). */
export interface HabitUpdateInput extends Partial<HabitCreateInput> {
    isActive?: boolean;  // Permite desactivar un hábito sin eliminarlo
}

// ─── Task ──────────────────────────────────────────

/** TaskCreateInput — Datos para crear una tarea. */
export interface TaskCreateInput {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;       // Fecha límite (ISO 8601: "2025-03-15T00:00:00Z")
    scheduledAt?: string;   // Fecha programada en el calendario
}

/** TaskUpdateInput — Datos para actualizar una tarea (todos opcionales). */
export interface TaskUpdateInput extends Partial<TaskCreateInput> {
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

// ─── Reward ────────────────────────────────────────

/** RewardCreateInput — Datos para crear una recompensa (solo admin). */
export interface RewardCreateInput {
    name: string;
    description?: string;
    cost: number;     // Coste en monedas para canjear
    icon?: string;
}

// ─── Progress ──────────────────────────────────────

/**
 * UserProgress — Resumen del progreso de un usuario.
 * Se devuelve en /api/rewards/progress.
 */
export interface UserProgress {
    points: number;           // Puntos totales acumulados
    coins: number;            // Monedas actuales (se gastan al canjear)
    level: number;            // Nivel actual del usuario
    habitsCompleted: number;  // Total de veces que ha completado hábitos
    tasksCompleted: number;   // Total de tareas completadas
    currentStreak: number;    // Días consecutivos activo (racha)
}

// ─── Friend Comparison ─────────────────────────────

/**
 * FriendComparison — Comparación de progreso entre dos usuarios.
 * Se devuelve en /api/friends/compare?friendId=...
 */
export interface FriendComparison {
    user: UserPublicProfile;
    friend: UserPublicProfile;
    userProgress: UserProgress;
    friendProgress: UserProgress;
}
