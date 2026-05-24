# Guía de Ejecución de GoHabit

## Acceso directo (sin instalación local)

La aplicación puede utilizarse directamente desde el siguiente enlace público:

https://gohabit.leinadtechs.com/

Este acceso es adecuado para uso funcional, demostraciones y validaciones rápidas sin necesidad de configurar el entorno en un equipo local.

## Levantamiento local (recomendado para desarrollo)

### 1. Requisitos previos

1. Docker Desktop instalado y en ejecución.
2. Docker Compose habilitado.
3. Node.js (opcional, útil para pruebas fuera de contenedores).

### 2. Ubicación del proyecto

Abrir una terminal en la carpeta raíz del repositorio:

```bash
cd "C:\Users\danie\OneDrive - UFV\Documentos\3 CARRERA\PROYECTOS\GRUPO_05_GoHabit_Proyecto"
```

### 3. Inicio de servicios

Ejecutar el siguiente comando:

```bash
docker compose up -d --build
```

Este proceso inicia los servicios principales del sistema:

1. MySQL (base de datos)
2. Backend (API)
3. Frontend (Nginx con recursos estáticos)

### 4. Verificación de funcionamiento

Una vez iniciados los contenedores, verificar los puntos de acceso:

1. Frontend local: http://localhost:8088
2. Backend local: http://localhost:3000
3. Estado del backend (health check): http://localhost:3000/api/health

### 5. Detener servicios

Para detener todos los contenedores:

```bash
docker compose down
```

Para detener y limpiar volúmenes (reinicio completo de datos locales):

```bash
docker compose down -v
```

## Recomendación de uso

1. Para uso normal de la aplicación, utilizar el enlace público:
	https://gohabit.leinadtechs.com/
2. Para desarrollo, depuración o pruebas técnicas, usar el entorno local con Docker Compose.

## Nota 
Es importante destacar que los dias de fútbol por culpa de el pirateo los servidores de cloudfare pueden caher. 
Por otro lado el sistema de inteligencia artificial solo se encuentra en el servidor de cloudfare, ya que por temas de seguridad github no nos permitia poder meter la api key.