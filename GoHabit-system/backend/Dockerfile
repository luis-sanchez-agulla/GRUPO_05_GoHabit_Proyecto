# ════════════════════════════════════════════════════════════════
# Dockerfile — Imagen Docker de producción para el backend
# ════════════════════════════════════════════════════════════════
#
# Usa un build "multi-stage" (varias etapas) para que la imagen
# final sea lo más pequeña posible (~150MB vs ~1GB sin optimizar).
#
# Etapas:
#   1. deps    → Instala dependencias (node_modules)
#   2. builder → Compila el proyecto (next build)
#   3. runner  → Imagen final mínima solo con lo necesario
#
# Para construir: docker build -t gohabit-backend .
# Para ejecutar:  docker run -p 3000:3000 gohabit-backend

# ── Stage 1: Instalar dependencias ──────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de definición de paquetes
COPY package.json package-lock.json* ./

# Instalamos dependencias (incluyendo prisma)
# Usamos install en lugar de ci para ser más flexibles con el lockfile generado en Windows
RUN npm install

# Stage 2: Builder
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Instalar openssl aquí también
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiar el código fuente
COPY . .

# Generar el cliente de Prisma
# Usamos npx para asegurar que usa el binario local de node_modules
RUN npx prisma generate

# Variables para Next.js build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compilar la aplicación standalone
RUN npm run build

# Stage 3: Runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Instalar openssl en el runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para el runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
