# Hoja de Ruta: Implementación de Gamificación en GoHabit

Este documento detalla los pasos necesarios para implementar las funcionalidades de gamificación (rachas, evolución del avatar y cajas de loot) siguiendo la arquitectura modular establecida.

---

## 1. Sistema de Rachas (Streaks) por Hábito

Actualmente tenemos una racha global en el usuario, pero los hábitos deben tener su propia racha para fomentar la constancia individual.

### Tareas:
- [x] **Entidad**: Añadir `currentStreak` y `maxStreak` a la interfaz [Habit](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/entities/habit.entity.ts#5-19).
    - **Archivo**: [src/entities/habit.entity.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/entities/habit.entity.ts)
- [x] **Repositorio**: Actualizar `habitRepository.create` y `habitRepository.update` para manejar estos campos.
    - **Archivo**: [src/repositories/habit.repository.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/repositories/habit.repository.ts)
- [x] **Servicio**: En `habitService.complete`, añadir la lógica para incrementar la racha si el último completado fue ayer, o resetearla si pasó más tiempo.
    - **Archivo**: [src/services/habit.service.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/services/habit.service.ts)
    - **Pista**: Usa la función [checkStreaks](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/controllers/habit.controller.ts#70-80) existente como base, pero guarda el resultado en la tabla de hábitos.

---

## 2. Evolución del Avatar (Árbol) y Estados

El usuario progresa visualmente a través de niveles y etapas del árbol (Semilla, Brote, Árbol Joven, Árbol Adulto, Gran Árbol).

### Tareas:
- [ ] **Entidad**: Añadir `treeStage` (string) a [UserPublicProfile](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/entities/user.entity.ts#5-14).
    - **Archivo**: [src/entities/user.entity.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/entities/user.entity.ts)
- [x] **Servicio**: Mejorar `userService.setXpAndCoins` para que, además de calcular el nivel, determine el `treeStage` basado en umbrales de puntos.
    - **Archivo**: [src/services/user.service.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/services/user.service.ts)
    - **Pista**: Define un objeto constante `TREE_STAGES` con los rangos de puntos/niveles para cada etapa.
- [x] **Repositorio**: Añadir `updateTreeStage` a `userRepository` o integrar en [updateStats](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/repositories/user.repository.ts#73-79).
    - **Archivo**: [src/repositories/user.repository.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/repositories/user.repository.ts)

---

## 3. Cajas de Loot (Loot Boxes) Aleatorias

Sistema para gastar monedas y obtener accesorios decorativos aleatorios según su rareza.

### Tareas:
- [ ] **Repositorio de Recompensas**: Crear métodos para obtener los accesorios contenidos en una caja específica.
    - **Archivo**: [src/repositories/reward.repository.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/repositories/reward.repository.ts)
    - **Sugerencia**: `findAccessoriesByLootBox(lootBoxId: string)`
- [ ] **Servicio de Recompensas**: Implementar `openLootBox`.
    - **Archivo**: [src/services/reward.service.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/services/reward.service.ts)
    - **Ayuda/Lógica**:
        1. Verificar si el usuario tiene suficientes monedas.
        2. Obtener lista de posibles items.
        3. Generar un número aleatorio para elegir el item (puedes ponderar por rareza).
        4. Restar monedas y añadir el item al inventario ([createRedemption](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/repositories/reward.repository.ts#20-26)) en una transacción.
- [ ] **Controlador**: Crear el endpoint `POST /api/rewards/lootbox/open`.
    - **Archivo**: [src/controllers/reward.controller.ts](file:///c:/Users/sluis/Documents/Ingenieria%20Informatica/3ro/Segundo/Proyectos%20ll/GRUPO_05_GoHabit_Proyecto/GoHabit-system/backend/src/controllers/reward.controller.ts)

---

## 4. Gestión de Estados y Notificaciones

### Tareas:
- [ ] **Estados Dinámicos**: Implementar un servicio que verifique diariamente (o al login) si alguna racha se ha roto por inactividad.
    - **Archivo**: Nuevo `src/services/status.service.ts`
- [ ] **Validación**: Crear esquemas de Zod para la apertura de cajas (ej. `lootBoxId` requerido).
    - **Archivo**: `src/validations/reward.schema.ts`

---

## Ayudas y Pistas Generales

> [!TIP]
> **Transacciones**: Siempre que realices cambios en múltiples tablas (ej: restar monedas y dar un item), usa `connection.beginTransaction()` para asegurar que no haya pérdida de datos si algo falla.

> [!IMPORTANT]
> **Aleatoriedad**: Para el sistema de loot, no uses simplemente `Math.random()`. Intenta crear un sistema de "pesos" donde los items 'Comunes' tengan un peso de 70, 'Raros' 25 y 'Legendarios' 5.

> [!NOTE]
> **Arquitectura**: Recuerda que el **Controller** solo recibe la petición y llama al **Service**, el **Service** contiene la lógica de negocio (como el cálculo de la racha o el sorteo del item) y el **Repository** es el único que toca la base de datos.
