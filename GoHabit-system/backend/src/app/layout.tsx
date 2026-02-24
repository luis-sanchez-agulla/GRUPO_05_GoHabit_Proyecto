/**
 * Root layout — Requerido por Next.js App Router.
 * Como este proyecto es API-only, el layout es mínimo.
 */

export const metadata = {
    title: "GoHabit API",
    description: "GoHabit Backend API",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
