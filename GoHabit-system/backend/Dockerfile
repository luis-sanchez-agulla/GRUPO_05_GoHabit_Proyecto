# ════════════════════════════════════════════════════════════════
# Dockerfile — Imagen Docker de producción para el backend
# ════════════════════════════════════════════════════════════════
#
# Usa un build "multi-stage" (varias etapas) para que la imagen
# final sea lo más pequeña posible (~150MB).
#
# Etapas:
#   1. deps    → Instala dependencias (node_modules)
#   2. builder → Compila el proyecto (next build)
#   3. runner  → Imagen final mínima solo con lo necesario

# ── Stage 1: Instalar dependencias ──────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de definición de paquetes
COPY package.json package-lock.json* ./

# Instalamos dependencias
# Usamos install en lugar de ci para ser más flexibles con el lockfile generado en Windows
RUN npm install

# ── Stage 2: Builder ────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiar el código fuente
COPY . .

# Variables para Next.js build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Omitimos la validación estricta de variables en tiempo de compilación para que build pase
ENV SKIP_ENV_VALIDATION=1
ENV OPENAI_API_KEY="dummy-for-build"

# Compilar la aplicación standalone
RUN npm run build

# ── Stage 3: Runner ─────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para el runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
