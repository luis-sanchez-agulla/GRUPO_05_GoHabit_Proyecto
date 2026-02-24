/**
 * Root page — Redirige a /api/health.
 * Este proyecto es API-only, no tiene frontend.
 */

import { redirect } from "next/navigation";

export default function Home() {
    redirect("/api/health");
}
