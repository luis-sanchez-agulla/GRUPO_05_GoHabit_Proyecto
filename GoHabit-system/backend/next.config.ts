/**
 * ═══════════════════════════════════════════════════════════════
 * next.config.ts — Configuración del framework Next.js
 * ═══════════════════════════════════════════════════════════════
 *
 * Este archivo controla el comportamiento global de Next.js.
 * Como este proyecto es API-only (sin frontend visual), la
 * configuración está optimizada para servir solo rutas API.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /**
     * output: "standalone"
     * ─────────────────────
     * Genera un build autocontenido que incluye solo los archivos necesarios.
     * Esto permite crear imágenes Docker mucho más pequeñas porque no
     * necesitamos copiar todo el directorio node_modules.
     * El resultado es un archivo server.js que se ejecuta con `node server.js`.
     */
    output: "standalone",

    /**
     * images.unoptimized: true
     * ────────────────────────
     * Desactiva el servicio de optimización de imágenes de Next.js.
     * No lo necesitamos porque este proyecto no sirve imágenes —
     * es puramente un backend API.
     */
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
