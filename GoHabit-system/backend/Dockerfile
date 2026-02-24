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
# Usa Node 20 en Alpine Linux (imagen ligera ~50MB)
FROM node:20-alpine AS deps
WORKDIR /app

# Copiamos solo package.json primero para aprovechar la caché de Docker.
# Si package.json no cambia, Docker reutiliza esta capa sin reinstalar.
COPY package.json package-lock.json* ./

# npm ci instala versiones EXACTAS del lockfile (más seguro que npm install)
RUN npm ci --ignore-scripts

# Generamos el cliente Prisma (necesario para que TypeScript compile)
RUN npx prisma generate || true

# ── Stage 2: Build ──────────────────────────────────
# Compilamos el proyecto Next.js
FROM node:20-alpine AS builder
WORKDIR /app

# Traemos node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiamos todo el código fuente
COPY . .

# Regeneramos Prisma (ahora con el schema.prisma disponible)
RUN npx prisma generate
# Compilamos Next.js → genera .next/standalone
RUN npm run build

# ── Stage 3: Producción ────────────────────────────
# Imagen final mínima — solo contiene lo necesario para ejecutar
FROM node:20-alpine AS runner
WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3000

# Creamos un usuario no-root por seguridad
# (evita que el proceso tenga permisos de administrador)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo los archivos necesarios del build:
# - public/         → archivos estáticos (vacío en nuestro caso)
# - .next/standalone → servidor compilado + dependencias mínimas
# - .next/static    → assets estáticos generados por Next.js
# - prisma/         → schema necesario para las queries en runtime
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Ejecutamos como usuario no-root
USER nextjs

# Exponemos el puerto 3000
EXPOSE 3000

# Comando de arranque — ejecuta el servidor standalone generado
CMD ["node", "server.js"]
