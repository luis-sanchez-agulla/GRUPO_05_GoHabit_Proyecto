# Start-up Guide (PowerUp.md)

Para probar que todo funciona correctamente (tanto el frontend como el backend), sigue estos pasos:

## 1. Levantar la Base de Datos con Docker
Abre una terminal en la ruta principal del proyecto y ejecuta:

```bash
cd "c:\Users\sluis\Documents\Ingenieria Informatica\3ro\Segundo\Proyectos ll\GRUPO_05_GoHabit_Proyecto\GoHabit-system"
docker-compose up -d
```
Esto iniciará el contenedor de MySQL en segundo plano.

## 2. Iniciar el Backend (Next.js)
Abre otra terminal o en la misma navega al directorio del backend:

```bash
cd "c:\Users\sluis\Documents\Ingenieria Informatica\3ro\Segundo\Proyectos ll\GRUPO_05_GoHabit_Proyecto\GoHabit-system\backend"
npm install
npm run db:push
npm run db:seed
npm run dev
```

Esto instalará las dependencias (si no lo están), sincronizará la base de datos, insertará datos iniciales de prueba y levantará el API en `http://localhost:3000`.

## 3. Probar el Frontend
1. Abre los archivos `.html` (ej., `index.html`, `anadirHabito.html`, `habitos.html`) en tu navegador web. Si usas VS Code, te recomiendo la extensión "Live Server" para evitar problemas de CORS.
2. Como aún no hay login y registro reales, los archivos HTML han sido configurados para simular una sesión válida de prueba para un usuario existente (`userId = 1` o el ID que genere el seed de Prisma).

---
**Nota:** El backend ha sido configurado para aceptar peticiones temporalmente o los scripts de frontend han sido adaptados para incluir un token de prueba hasta que implementemos la pantalla de Login y Registro reales.
