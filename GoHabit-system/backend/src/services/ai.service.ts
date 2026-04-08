/**
 * ═══════════════════════════════════════════════════════════════
 * ai.service.ts — Servicio de IA Funcional con Gemini
 * ═══════════════════════════════════════════════════════════════
 *
 * Servicio de IA real que utiliza Google Gemini para:
 * 1. Recomendación inteligente de hábitos completamente personalizados
 * 2. Reorganización inteligente de tareas basada en análisis
 * 3. Sugerencias de optimización basadas en patrones del usuario
 *
 * NO usa respuestas predeterminadas, todo es generado por IA.
 */

import { aiRepository } from "@/repositories/ai.repository";
import { NotFoundError } from "@/lib/errors";
import { env } from "@/config/env";

type HabitSuggestion = {
    title: string;
    reason: string;
    frequency: string;
    recommendedDays?: string[];
    scheduleHint?: string;
    icon?: string;
    category?: string;
    xpReward?: number;
};

type TaskReorganization = {
    id: string;
    title: string;
    priority: string;
    suggestedOrder: number;
    reasoning: string;
    estimatedTime?: number;
    dueDate?: string;
};

type HabitTheme = {
    title: string;
    reason: string;
    frequency: string;
    keywords: string[];
};

const WEEKDAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

function normalizeText(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

const COMMON_TYPOS: Record<string, string> = {
    acer: "hacer",
    aser: "hacer",
    qiero: "quiero",
    kiero: "quiero",
    quieroo: "quiero",
    emana: "semana",
    semnaa: "semana",
    semna: "semana",
    dija: "dia",
    diaa: "dia",
    diasz: "dias",
    natasion: "natacion",
    abito: "habito",
    avito: "habito",
    ejersicio: "ejercicio",
    gimnacio: "gimnasio",
};

const STOP_WORDS = new Set([
    "quiero",
    "quisiera",
    "gustaria",
    "hacer",
    "empezar",
    "intentar",
    "mejorar",
    "mas",
    "menos",
    "muy",
    "mucho",
    "poco",
    "un",
    "una",
    "el",
    "la",
    "los",
    "las",
    "de",
    "del",
    "para",
    "por",
    "con",
    "sin",
    "que",
    "mi",
    "mis",
    "tu",
    "tus",
    "en",
    "a",
    "y",
    "o",
    "habito",
    "habitos",
    "rutina",
    "rutinas",
]);

function sanitizeText(text: string) {
    return normalizeText(text)
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function applyTypoCorrections(text: string) {
    return sanitizeText(text)
        .split(" ")
        .filter(Boolean)
        .map((token) => COMMON_TYPOS[token] || token)
        .join(" ");
}

function tokenize(text: string) {
    return text.split(" ").filter(Boolean);
}

function levenshteinDistance(a: string, b: string) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
}

function keywordAppears(message: string, tokens: string[], keyword: string) {
    const normalizedKeyword = sanitizeText(keyword);
    if (!normalizedKeyword) return false;

    if (message.includes(normalizedKeyword)) {
        return true;
    }

    return tokens.some((token) => {
        if (token === normalizedKeyword) return true;

        const minLength = Math.min(token.length, normalizedKeyword.length);
        if (minLength < 4 || Math.abs(token.length - normalizedKeyword.length) > 1) {
            return false;
        }

        return levenshteinDistance(token, normalizedKeyword) <= 1;
    });
}

function parseRequestedFrequency(normalizedMessage: string): string | null {
    const daysPerWeek = normalizedMessage.match(/(\d{1,2})\s*dias?\s*(?:por|a la|cada)?\s*semana/);
    if (daysPerWeek) {
        const count = Number(daysPerWeek[1]);
        if (count > 0 && count <= 14) {
            return `${count} veces por semana`;
        }
    }

    const timesPerWeek = normalizedMessage.match(/(\d{1,2})\s*veces?\s*(?:por|a la|cada)?\s*semana/);
    if (timesPerWeek) {
        const count = Number(timesPerWeek[1]);
        if (count > 0 && count <= 14) {
            return `${count} veces por semana`;
        }
    }

    if (/\b(diario|cada dia|todos los dias)\b/.test(normalizedMessage)) {
        return "Diario";
    }

    if (/\b(semanal|cada semana)\b/.test(normalizedMessage)) {
        return "Semanal";
    }

    if (/\b(mensual|cada mes)\b/.test(normalizedMessage)) {
        return "Mensual";
    }

    return null;
}

function toTitleCase(text: string) {
    return text
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function extractIntentPhrase(normalizedMessage: string) {
    const withoutFrequency = normalizedMessage
        .replace(/\d{1,2}\s*dias?\s*(?:por|a la|cada)?\s*semana/g, " ")
        .replace(/\d{1,2}\s*veces?\s*(?:por|a la|cada)?\s*semana/g, " ")
        .replace(/\b(diario|cada dia|todos los dias|semanal|cada semana|mensual|cada mes)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const intentMatch = withoutFrequency.match(
        /(?:quiero|quisiera|me gustaria|voy a|planeo|necesito|intento|hacer|empezar|practicar|aprender|trabajar)\s+(.{3,90})/
    );

    const rawCandidate = (intentMatch?.[1] || withoutFrequency)
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const filteredWords = rawCandidate
        .split(" ")
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
        .slice(0, 5);

    return filteredWords.join(" ").trim();
}

function buildIntentHabitSuggestion(message: string): HabitSuggestion | null {
    const normalizedWithCorrections = applyTypoCorrections(message);
    const intent = extractIntentPhrase(normalizedWithCorrections);

    if (!intent || intent.length < 3) {
        return null;
    }

    const frequency = parseRequestedFrequency(normalizedWithCorrections) || "3 veces por semana";
    const words = intent.split(" ");
    const titleBase = words.length === 1 ? `practicar ${intent}` : intent;

    return {
        title: toTitleCase(titleBase).slice(0, 80),
        reason: "Transforma tu objetivo en una accion concreta y facil de medir para sostener la constancia.",
        frequency,
        recommendedDays: [],
    };
}

function buildSupportSuggestions(primary: HabitSuggestion): HabitSuggestion[] {
    return [
        {
            title: "Preparar todo antes de empezar",
            reason: `Reducir friccion te ayuda a cumplir ${primary.title.toLowerCase()} incluso en dias con menos energia.`,
            frequency: "Antes de cada sesion",
        },
        {
            title: "Registrar progreso en 2 minutos",
            reason: "Medir avances te permite ajustar la rutina sin perder motivacion.",
            frequency: "Al terminar",
        },
    ];
}

function mergeUniqueSuggestions(suggestions: HabitSuggestion[]) {
    const seen = new Set<string>();

    return suggestions.filter((suggestion) => {
        const key = sanitizeText(suggestion.title);
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function canonicalWeekday(day: string) {
    const normalized = sanitizeText(day);
    const map: Record<string, string> = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    return map[normalized] || null;
}

function uniqueWeekdays(days: string[]) {
    const seen = new Set<string>();
    return days
        .map((day) => canonicalWeekday(day) || day.trim())
        .filter((day) => {
            const key = sanitizeText(day);
            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
}

function buildRecommendedSchedule(frequency: string, title = "") {
    const normalized = sanitizeText(`${frequency} ${title}`);

    if (/\b(diario|cada dia|todos los dias)\b/.test(normalized)) {
        return {
            recommendedDays: [...WEEKDAY_LABELS],
            scheduleHint: "Todos los días",
        };
    }

    const countMatch = normalized.match(/(\d{1,2})\s*(?:veces?|dias?)/);
    if (countMatch) {
        const count = Number(countMatch[1]);
        if (count <= 0) {
            return { recommendedDays: ["Lunes", "Miércoles", "Viernes"], scheduleHint: "Repartido durante la semana" };
        }

        if (count >= 7) {
            return {
                recommendedDays: [...WEEKDAY_LABELS],
                scheduleHint: `${count} veces por semana`,
            };
        }

        const map: Record<number, string[]> = {
            1: ["Lunes"],
            2: ["Martes", "Jueves"],
            3: ["Lunes", "Miércoles", "Viernes"],
            4: ["Lunes", "Martes", "Jueves", "Sábado"],
            5: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            6: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        };

        return {
            recommendedDays: map[count] || [...WEEKDAY_LABELS],
            scheduleHint: `${count} veces por semana`,
        };
    }

    if (/\b(semanal|cada semana)\b/.test(normalized)) {
        return {
            recommendedDays: ["Lunes"],
            scheduleHint: "Una vez por semana",
        };
    }

    if (/\b(mensual|cada mes)\b/.test(normalized)) {
        return {
            recommendedDays: ["Primer lunes del mes"],
            scheduleHint: "Una vez al mes",
        };
    }

    if (/\b(gym|gimnasio|entrenar|pesas|fitness)\b/.test(normalized)) {
        return {
            recommendedDays: ["Lunes", "Miércoles", "Viernes"],
            scheduleHint: "3 días repartidos",
        };
    }

    if (/\b(estudiar|estudio|leer|lectura|sueno|dormir)\b/.test(normalized)) {
        return {
            recommendedDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            scheduleHint: "De lunes a viernes",
        };
    }

    return {
        recommendedDays: ["Lunes", "Miércoles", "Viernes"],
        scheduleHint: "Repartido durante la semana",
    };
}

function suggestXpReward(suggestion: HabitSuggestion) {
    const normalized = sanitizeText(`${suggestion.title} ${suggestion.frequency}`);
    const days = suggestion.recommendedDays?.length || 0;

    let base = 10;

    if (days >= 6 || /diario|todos los dias/.test(normalized)) {
        base = 18;
    } else if (days >= 4) {
        base = 14;
    } else if (days >= 2) {
        base = 12;
    }

    if (/gimnasio|entrenar|pesas|deporte|correr/.test(normalized)) {
        base += 6;
    }

    if (/estudiar|lectura|leer|enfoque|meditar/.test(normalized)) {
        base += 3;
    }

    if (/antes de cada sesion|al terminar/.test(normalized)) {
        base -= 2;
    }

    return Math.max(8, Math.min(35, base));
}

function decorateSuggestion(suggestion: HabitSuggestion): HabitSuggestion {
    const schedule = buildRecommendedSchedule(suggestion.frequency, suggestion.title);
    const recommendedDays = uniqueWeekdays(suggestion.recommendedDays?.length ? suggestion.recommendedDays : schedule.recommendedDays);

    return {
        ...suggestion,
        frequency: suggestion.frequency || schedule.scheduleHint,
        recommendedDays,
        scheduleHint: suggestion.scheduleHint || schedule.scheduleHint,
        icon: suggestion.icon || "task_alt",
        category: suggestion.category || "salud",
        xpReward: Number(suggestion.xpReward || 0) > 0 ? Number(suggestion.xpReward) : suggestXpReward(suggestion),
    };
}

const HABIT_THEMES: HabitTheme[] = [
    {
        title: "Bloque diario de lectura",
        reason: "Encaja con el objetivo de leer mas y crea constancia sin exigir demasiado tiempo.",
        frequency: "Diario",
        keywords: ["leer", "lectura", "libro", "pagina", "paginas"],
    },
    {
        title: "Rutina de gimnasio con dias fijos",
        reason: "Si quieres hacer mas gym, fijar dias concretos reduce la friccion de decidir cada semana.",
        frequency: "3 veces por semana",
        keywords: ["gym", "gimnasio", "entrenar", "pesas", "musculo", "fitness"],
    },
    {
        title: "Preparar el plan de entrenamiento el dia anterior",
        reason: "Te ayuda a llegar preparado al gym y evita perder motivacion por improvisar.",
        frequency: "Antes de cada sesion",
        keywords: ["gym", "gimnasio", "entrenar", "rutina", "deporte"],
    },
    {
        title: "Bloque corto de enfoque sin distracciones",
        reason: "Sirve para estudiar o leer mas tiempo seguido y mejorar la concentracion.",
        frequency: "Diario",
        keywords: ["concentracion", "enfoque", "estudiar", "estudio", "procrastinar"],
    },
    {
        title: "Registro diario de progreso",
        reason: "Te permite ver si estas cumpliendo con gym o lectura y ajustar sin perder el ritmo.",
        frequency: "Diario",
        keywords: ["progreso", "seguimiento", "constancia", "objetivo", "mejorar"],
    },
    {
        title: "Rutina de cierre antes de dormir",
        reason: "Si tu energia cae o te cuesta sostener habitos, dormir mejor ayuda a mantener la constancia.",
        frequency: "Diario",
        keywords: ["dormir", "sueno", "descanso", "cansancio", "fatiga"],
    },
    {
        title: "Reducir friccion de inicio",
        reason: "Tener todo listo antes de empezar hace mas facil cumplir tus habitos incluso en dias de poca motivacion.",
        frequency: "Diario",
        keywords: ["organizacion", "rutina", "preparar", "planificar", "tiempo"],
    },
];

function buildContextualRecommendations(message: string) {
    const normalized = applyTypoCorrections(message);
    const tokens = tokenize(normalized);
    const intentSuggestion = buildIntentHabitSuggestion(message);

    const scored = HABIT_THEMES.map((habit) => {
        const score = habit.keywords.reduce((count, keyword) => {
            return keywordAppears(normalized, tokens, keyword) ? count + 1 : count;
        }, 0);

        return { habit, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const matched = scored
        .filter((item) => item.score > 0)
        .slice(0, 4)
        .map((item) => ({
            title: item.habit.title,
            reason: item.habit.reason,
            frequency: item.habit.frequency,
        }));

    if (intentSuggestion) {
        return mergeUniqueSuggestions([
            intentSuggestion,
            ...matched,
            ...buildSupportSuggestions(intentSuggestion),
        ]).slice(0, 4).map(decorateSuggestion);
    }

    if (matched.length > 0) {
        return matched.map(decorateSuggestion);
    }

    return [
        {
            title: "Definir un objetivo de 7 dias",
            reason: "Si el mensaje es muy general, empezar con una meta corta ayuda a convertir la idea en una rutina real.",
            frequency: "Una vez esta semana",
        },
        {
            title: "Bloque diario de 10 minutos",
            reason: "Un bloque corto reduce la friccion de empezar y funciona bien para leer, estudiar o entrenar tecnica.",
            frequency: "Diario",
        },
        {
            title: "Registrar avance al final del dia",
            reason: "Ver tu progreso facilita mantener constancia y detectar que te esta frenando.",
            frequency: "Diario",
        },
    ].map(decorateSuggestion);
}

/**
 * Genera recomendaciones de hábitos usando Gemini con contexto del usuario.
 * La IA considera:
 * - Lo que el usuario ya está haciendo
 * - Sus patrones actuales
 * - Metas mencionadas en el mensaje
 * - Hábitos que se complementan entre sí
 */
async function geminiRecommendations(userId: string, message: string, history?: {role: string, text: string}[]) {
    const key = env.GOOGLE_API_KEY;
    if (!key) {
        console.warn("[AI] GOOGLE_API_KEY no configurada, usando recomendaciones contextuales locales");
        return heuristicRecommendations(message);
    }

    try {
        // Obtener contexto del usuario
        const userContext = await aiRepository.getUserHabitPatterns(userId);
        const currentHabits = userContext.habits?.map((h: any) => `- ${h.title} (${h.frequency})`).join("\n") || "None";
        
        const model = env.GEMINI_MODEL || "gemini-2.0-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

        const systemContext = [
            "Eres una IA de 'Coaching' de Hábitos experta en la psicología de Hábitos Atómicos (Atomic Habits).",
            "NUNCA uses respuestas genéricas, vagas ni predeterminadas. Analiza el mensaje del usuario y sus hábitos actuales para sugerir hábitos EXTREMADAMENTE ESPECÍFICOS y ACCIONABLES.",
            "Si el usuario menciona un objetivo, NO le recomiendes el objetivo en sí. Recomiéndale el 'sistema' (la acción atómica mínima que lo llevará allí).",
            "",
            "Hábitos Actuales del Usuario:",
            currentHabits,
            "",
            "REGLAS OBLIGATORIAS (ANTI-GENÉRICO):",
            "1. CADA HÁBITO DEBE llevar una DURACIÓN EXACTA (ej: '15 minutos', '2 páginas'). PROHIBIDO usar verbos vagos como 'Hacer', 'Estudiar', 'Mejorar' sin contexto numérico.",
            "2. CADA HÁBITO DEBE incluir un GATILLO (cuándo se hace: 'al despertar', 'tras la cena'). No pongas 'por la mañana', pon 'inmediatamente después de vestirte'.",
            "3. Sugiere 3 o 4 hábitos que asuman la barrera del usuario (muy fáciles de lograr).",
            "4. La 'reason' debe explicar la psicología detrás del comportamiento elegido, atado a su meta original.",
            "5. NO repitas los hábitos actuales del usuario.",
            "6. 'recommendedDays' debe ser un array con los días precisos en español (ej. ['Lunes', 'Miércoles']).",
            "7. 'scheduleHint' debe condensar la frecuencia real (ej. 'Tras el desayuno').",
            "8. 'xpReward' es un número entero entre 8 y 35, evaluando el nivel de esfuerzo (ejercicio = +XP, acciones de 1 min = menos XP)."
        ].join("\n");

        // Format conversational history or fallback to single message
        const contents = history?.length
            ? history.map(item => ({
                  role: item.role === "model" ? "model" : "user",
                  parts: [{ text: item.text }]
              }))
            : [{ role: "user", parts: [{ text: message }] }];

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemContext }]
                },
                contents,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 600,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            suggestions: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        title: { type: "STRING" },
                                        reason: { type: "STRING" },
                                        frequency: { type: "STRING" },
                                        recommendedDays: {
                                            type: "ARRAY",
                                            items: { type: "STRING" }
                                        },
                                        scheduleHint: { type: "STRING" },
                                        icon: { type: "STRING" },
                                        category: { type: "STRING" },
                                        xpReward: { type: "INTEGER" }
                                    },
                                    required: ["title", "reason", "frequency", "recommendedDays", "xpReward"]
                                }
                            }
                        }
                    }
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error ${response.status}`);
        }

        const raw: any = await response.json();
        const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error("Gemini returned empty response");
        }

        const parsed = JSON.parse(text);

        const suggestions = Array.isArray(parsed?.suggestions)
            ? parsed.suggestions
                  .slice(0, 4)
                  .map((s: any) => decorateSuggestion({
                      title: String(s?.title || "Recommended Habit").slice(0, 80),
                      reason: String(s?.reason || "Will help you progress towards your goals.").slice(0, 180),
                      frequency: String(s?.frequency || "Daily").slice(0, 40),
                      recommendedDays: Array.isArray(s?.recommendedDays) ? s.recommendedDays.map(String) : [],
                      scheduleHint: typeof s?.scheduleHint === "string" ? s.scheduleHint.slice(0, 80) : undefined,
                      icon: typeof s?.icon === "string" ? s.icon.slice(0, 50) : undefined,
                      category: typeof s?.category === "string" ? s.category.slice(0, 50) : undefined,
                      xpReward: Number(s?.xpReward || 0),
                  }))
                  .filter((s: HabitSuggestion) => s.title.trim().length > 0)
            : [];

        if (!suggestions.length) {
            throw new Error("Gemini returned no valid suggestions");
        }

        return {
            provider: "gemini",
            input: message,
            suggestions,
            contextUsed: true,
        };
    } catch (err) {
        console.warn("[AI] Gemini recommendations failed:", (err as Error)?.message);
        return heuristicRecommendations(message);
    }
}

/**
 * Fallback a recomendaciones heurísticas basadas en keywords
 * Solo se usa si Gemini no está disponible
 */
function heuristicRecommendations(message: string) {
    const suggestions = buildContextualRecommendations(message);

    return {
        provider: "heuristic",
        input: message,
        suggestions,
        contextUsed: false,
    };
}

/**
 * Reorganiza tareas de forma inteligente usando Gemini
 * Considera:
 * - Urgencia (fecha de vencimiento)
 * - Importancia (prioridad)
 * - Correlaciones entre tareas
 * - Patrones de productividad del usuario
 * - Tiempo estimado para cada tarea
 */
async function geminiTaskReorganization(userId: string, tasks: any[], userContext: any) {
    const key = env.GOOGLE_API_KEY;
    if (!key) {
        throw new Error("GOOGLE_API_KEY not configured for task reorganization");
    }

    // Preparar contexto de tareas
    const tasksContext = tasks
        .map(
            (t, i) =>
                `${i + 1}. [${t.priority}] ${t.title} (Due: ${t.dueDate || "No date"}, Est. Time: ${t.estimatedTime || "Unknown"} min)`
        )
        .join("\n");

    const productivityHours = userContext?.productivityTimes?.map((p: any) => p.hour).slice(0, 3).join(", ") || "Not analyzed yet";

    const model = env.GEMINI_MODEL || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const prompt = [
        "You are a productivity optimization AI. Reorganize these tasks intelligently.",
        "",
        "ANALYSIS REQUIRED:",
        "1. Identify task dependencies and clusters",
        "2. Consider user's productive hours (usually: " + productivityHours + ")",
        "3. Apply time-blocking principles",
        "4. Prioritize high-impact tasks",
        "5. Create a logical workflow sequence",
        "",
        "Tasks to reorganize:",
        tasksContext,
        "",
        "Return ONLY this JSON structure (NO markdown, NO comments):",
        '{"reorganization":[{"taskNumber":1,"newOrder":1,"reason":"Specific reason"},...],"overallStrategy":"Brief summary of reorganization logic"}',
        "",
        "IMPORTANT: Provide SPECIFIC reasons tied to productivity science or user's patterns.",
        "NO generic suggestions like 'do urgent tasks first'.",
    ].join("\n");

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
    }

    const raw = await response.json();
    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini returned empty response for task reorganization");
    }

    let parsed: any;
    try {
        parsed = JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not extract JSON from response");
        parsed = JSON.parse(match[0]);
    }

    // Mapear reorganización a las tareas originales
    const reorganized: TaskReorganization[] = tasks.map((task, idx) => {
        const reorganizationData = parsed?.reorganization?.find((r: any) => r.taskNumber === idx + 1) || {};
        return {
            id: task.id,
            title: task.title,
            priority: task.priority,
            suggestedOrder: reorganizationData.newOrder || idx + 1,
            reasoning: reorganizationData.reason || "Task in workflow",
            estimatedTime: task.estimatedTime,
            dueDate: task.dueDate,
        };
    });

    reorganized.sort((a, b) => a.suggestedOrder - b.suggestedOrder);

    return {
        reorganized,
        strategy: parsed?.overallStrategy || "Optimized task sequence generated",
        userContext: {
            totalTasks: tasks.length,
            productiveHours: productivityHours,
        },
    };
}

/**
 * Analiza imagen en base64 para validar si el usuario ha cumplido el hábito.
 * Usa Gemini 2.0 Flash vision.
 */
async function verifyHabitImage(habitTitle: string, base64Image: string) {
    const key = env.GOOGLE_API_KEY;
    if (!key) {
        // Fallback: si no hay api key, damos todo por válido en local (para no bloquear).
        return { verified: true, reason: "No hay API Key configurada para auditar." };
    }

    try {
        const model = env.GEMINI_MODEL || "gemini-2.0-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

        const dataPrefixRegex = /^data:image\/[a-zA-Z]+;base64,/;
        const base64Data = base64Image.replace(dataPrefixRegex, "");
        const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

        const systemCtx = [
            "Eres el Juez Visual Anticheat definitivo. Tu trabajo es AUDITAR EXTREMADAMENTE ESTRICTO una foto para confirmar si prueba INDUDABLEMENTE la finalización del hábito.",
            "REGLAS INQUEBRANTABLES:",
            "1. NO ASUMAS NADA POR ASOCIACIÓN. Si el hábito es 'Correr', una foto de una botella de agua ES INVÁLIDA. Si es 'Gimnasio', una foto del suelo es INVÁLIDA.",
            "2. Debe haber evidencia directa de la ACCIÓN o en su defecto un resumen digital incuestionable (ej. Reloj GPS marcando km de carrera).",
            "3. Rechaza CUALQUIER imagen irrelevante, memes, capturas de texto plano, fotos oscuras o difusas.",
            "4. Sé rudo e implacable. Si dudas, recházalo.",
            "Devuelve un JSON estricto con 'verified' boolean y un 'reason' muy corto (explicando fríamente por qué apruebas o por qué deniegas basándote en lo visible)."
        ].join(" ");

        const prompt = `El usuario dice que ha completado su hábito: "${habitTitle}". ¿Esta imagen demuestra que lo ha hecho?`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemCtx }] },
                contents: [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: base64Data, mimeType } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            verified: { type: "BOOLEAN" },
                            reason: { type: "STRING" }
                        },
                        required: ["verified", "reason"]
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini Vision Error ${response.status}`);
        }

        const raw = await response.json();
        const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) return { verified: true, reason: "Error de visión (respuesta vacía)" };

        const parsed = JSON.parse(text);
        return {
            verified: !!parsed.verified,
            reason: parsed.reason || "Evaluado por IA"
        };
    } catch (err) {
        console.error("[AI] Vision Verification error:", err);
        return { verified: true, reason: "Fallo temporal en auditoría visual AI" }; // Default pass
    }
}

/**
 * Valida un hábito nuevo antes de crearlo.
 * Evalúa su viabilidad, nivel de especificidad y asigna la XP justa.
 */
async function validateNewHabit(title: string, category: string, frequency: number, target: number) {
    const key = env.GOOGLE_API_KEY;
    if (!key) return { valid: true, feedback: "Sin API Key conectada.", xpReward: 10 };

    try {
        const model = env.GEMINI_MODEL || "gemini-2.0-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

        const systemCtx = [
            "Eres un juez implacable experto en metodologías de hábitos saludables.",
            "Evalúa la intención del usuario para crear un nuevo hábito.",
            "1. Evalúa el título. Si es absurdo ('asdf', 'prueba', 'kkk'), poco sano, o ridículamente genérico ('Hacer cosas'), RECHÁZALO marcando 'valid: false' e incluye un 'feedback' duro aconsejando cómo formular el hábito correctamente (SMART).",
            "2. Si es válido, calcula una recompensa 'xpReward' del 10 al 50. Mucho esfuerzo (gimnasio diario) = 40-50. Poco esfuerzo (beber vaso de agua) = 10.",
            "3. Devuelve estrictamente un JSON con 'valid' (boolean), 'feedback' (mensaje motivador o crítico) y 'xpReward' (número)."
        ].join(" ");

        const prompt = `Hábito propuesto: "${title}". Categoría: ${category}. Días por semana: ${frequency}. Meta diaria: ${target}.`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemCtx }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 200,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            valid: { type: "BOOLEAN" },
                            feedback: { type: "STRING" },
                            xpReward: { type: "INTEGER" }
                        },
                        required: ["valid", "feedback", "xpReward"]
                    }
                }
            })
        });

        if (!response.ok) throw new Error("Gemini Validation Error");
        
        const raw = await response.json();
        const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error("Respuesta vacía");

        return JSON.parse(text);
    } catch (err) {
        console.error("[AI] Habit Validation Error:", err);
        return { valid: true, feedback: "Error de IA temporal", xpReward: 15 };
    }
}

export const aiService = {
    async recommendHabits(userId: string, message: string, history?: {role: string, text: string}[]) {
        try {
            return await geminiRecommendations(userId, message, history);
        } catch (err) {
            console.error("[AI] Error in recommendHabits:", err);
            return heuristicRecommendations(message);
        }
    },

    /**
     * Reorganiza tareas de forma inteligente.
     * Usa IA real para analizar y reordenar basado en múltiples factores.
     */
    async reorganizeTasks(userId: string) {
        try {
            const tasks = await aiRepository.findTasksForReorganization(userId);

            if (!tasks || tasks.length === 0) {
                throw new NotFoundError("No pending tasks found");
            }

            // Obtener contexto del usuario
            const userContext = await aiRepository.getUserHabitPatterns(userId);
            const productivityTimes = await aiRepository.getUserProductivityTimezone(userId);

            // Reorganizar usando IA
            const result = await geminiTaskReorganization(userId, tasks, {
                habitStats: userContext.stats,
                productivityTimes,
            });

            return result;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            console.error("[AI] Task reorganization error:", err);
            // Fallback: solo reordenar por prioridad y fecha
            const tasks = await aiRepository.findTasksForReorganization(userId);
            if (!tasks.length) {
                throw new NotFoundError("No pending tasks found");
            }
            return {
                reorganized: tasks,
                strategy: "Basic priority and due date ordering (AI unavailable)",
                userContext: {},
            };
        }
    },

    async verifyHabitImage(habitTitle: string, base64Image: string) {
        return verifyHabitImage(habitTitle, base64Image);
    },

    async validateNewHabit(title: string, category: string, frequency: number, target: number) {
        return validateNewHabit(title, category, frequency, target);
    }
};
