# 🍓 Guía rápida: Desplegar GoHabit con MySQL en Raspberry Pi

## 📋 Requisitos

- ✅ Raspberry Pi 4B con **4GB RAM mínimo**
- ✅ Raspberry OS instalado (32-bit o 64-bit)
- ✅ 10GB de espacio libre en la tarjeta SD
- ✅ Conexión a internet (Ethernet recomendado)

---

## 🚀 Instalación en 5 pasos

### 1️⃣ Conectar a la Raspberry

```bash
# Desde tu PC
ssh pi@192.168.1.XX   # Cambiar XX por IP de tu Raspberry
# Contraseña por defecto: raspberry
```

### 2️⃣ Instalar dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar
docker --version
docker-compose --version
```

### 3️⃣ Clonar el proyecto

```bash
cd ~
git clone https://github.com/tu-usuario/gohabit.git
cd gohabit
```

### 4️⃣ Configurar variables de entorno

```bash
# Generar JWT_SECRET seguro
openssl rand -base64 32

# Copiar el resultado y pegarlo en el siguiente comando
# (Reemplazar XXX por el JWT generado)
```

Crear `.env`:
```bash
cat > .env << 'EOF'
JWT_SECRET=XXX_PEGAR_JWT_AQUI
EOF

# O simplemente usar el que viene por defecto (NO RECOMENDADO para producción)
```

### 5️⃣ Iniciar servicios

```bash
# Levantar contenedores (¡ya incluye optimizaciones para Raspberry!)
docker-compose up -d

# Esperar ~30 segundos a que todo inicie
sleep 30

# Verificar que están corriendo
docker-compose ps
```

**Resultado esperado:**
```
NAME                STATUS
gohabit-mysql       Up (healthy)
gohabit-backend     Up (healthy)
gohabit-frontend    Up
```

---

## 6️⃣ Inicializar base de datos con Prisma

```bash
# Generar cliente Prisma
docker exec gohabit-backend npx prisma generate

# Sincronizar schema con MySQL
docker exec gohabit-backend npx prisma db push

# Cargar datos iniciales
docker exec gohabit-backend npm run db:seed
```

---

## ✅ Verificar que funciona

### Desde la Raspberry:
```bash
curl http://localhost
```

### Desde otro dispositivo en la red:
```
http://192.168.1.XX     (cambiar XX por IP de tu Raspberry)
```

### Ver logs en tiempo real:
```bash
docker logs -f gohabit-backend
```

---

## 📊 Comandos útiles

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver consumo de recursos
```bash
docker stats
```

### Ver temperatura de la Raspberry
```bash
vcgencmd measure_temp
```

### Parar servicios
```bash
docker-compose down
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Ver logs
```bash
# Backend
docker logs -f gohabit-backend

# MySQL
docker logs -f gohabit-mysql

# Todos
docker-compose logs -f
```

---

## 💾 Backup de la base de datos

### Backup manual
```bash
# Crear backup
docker exec gohabit-mysql mysqldump -uroot -prootpass goto > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i gohabit-mysql mysql -uroot -prootpass goto < backup.sql
```

### Backup automático diario

```bash
# Crear script
cat > ~/backup-gohabit.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/gohabit-backups
mkdir -p $BACKUP_DIR
docker exec gohabit-mysql mysqldump -uroot -prootpass goto > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
echo "Backup completado: $BACKUP_DIR"
EOF

chmod +x ~/backup-gohabit.sh

# Agregar a cron (backup diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-gohabit.sh") | crontab -
```

---

## 🔧 Optimizaciones aplicadas

El archivo `docker-compose.yml` **ya incluye automáticamente** las optimizaciones para Raspberry Pi:

### ✅ Límites de recursos (en cada servicio bajo `deploy.resources`)
- **MySQL**: 256-512MB RAM, 1 CPU máximo
- **Backend**: 256-512MB RAM, 1.5 CPUs máximo  
- **Frontend**: 64-128MB RAM, 0.5 CPU máximo

> **💡 Nota**: Si despliegas en un servidor potente y notas limitaciones de rendimiento, puedes comentar las secciones `deploy:` en docker-compose.yml

### ✅ Configuración MySQL optimizada (`raspberry.cnf`)
- `max_connections = 50` (reducido de 200)
- `innodb_buffer_pool_size = 256M`
- `slow_query_log = 0` (desactivado para ahorrar I/O)
- `skip_log_bin` (sin binary logs para ahorrar espacio)

### ✅ Logs limitados
- Máximo 10MB por archivo
- Máximo 3 archivos rotativos

---

## 🌡️ Monitoreo

### Temperatura
```bash
# Ver temperatura actual
vcgencmd measure_temp

# Alerta si > 70°C:
#   - Agregar disipador
#   - Mejorar ventilación
#   - Verificar que no esté en caja cerrada
```

### Memoria
```bash
# Ver uso de memoria
free -h

# Ver uso por contenedor
docker stats --no-stream
```

### Disco
```bash
# Ver espacio disponible
df -h

# Ver tamaño de volúmenes Docker
docker system df
```

---

## 🌐 Acceso desde internet (Opcional)

### Opción 1: Solo red local (RECOMENDADO)
Ya funciona: `http://192.168.1.XX`

### Opción 2: Ngrok (rápido pero lento)
```bash
# Instalar ngrok
sudo snap install ngrok

# Exponer puerto
ngrok http 80

# Usar URL pública que genera (ej: https://xxxxx.ngrok.io)
```

### Opción 3: Tailscale VPN (RECOMENDADO para acceso remoto)
```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar
sudo tailscale up

# Ver IP de Tailscale
tailscale ip -4

# Acceder desde cualquier lugar con Tailscale: http://[IP-TAILSCALE]
```

---

## 🆘 Problemas comunes

### ❌ "Cannot connect to database"

```bash
# Verificar que MySQL está corriendo
docker ps | grep mysql

# Ver logs de MySQL
docker logs gohabit-mysql

# Reiniciar MySQL
docker-compose restart mysql

# Esperar 10 segundos
sleep 10
```

### ❌ "Out of memory"

```bash
# Ver uso de memoria
free -h

# Si está llena, reducir límites en docker-compose.yml:
# - MySQL: memory: 256M (en vez de 512M)
# - Backend: memory: 256M (en vez de 512M)

# O agregar swap (no ideal pero ayuda):
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### ❌ "Temperature too high"

```bash
vcgencmd measure_temp

# Si > 70°C:
# - Agregar mejor disipador
# - Mejorar ventilación
# - Reducir límites de CPU en compose
```

### ❌ "Disk full"

```bash
# Limpiar logs de Docker
docker system prune -f

# Limpiar volúmenes no usados
docker volume prune -f

# Ver qué ocupa espacio
du -sh /var/lib/docker/*
```

---

## 🔄 Actualizar GoHabit

```bash
cd ~/gohabit

# Detener servicios
docker-compose down

# Actualizar código
git pull origin main

# Reconstruir contenedores
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up -d

# Actualizar BD si hay cambios
docker exec gohabit-backend npx prisma db push
```

---

## 📊 Consumo esperado en Raspberry Pi 4B (4GB)

| Servicio | RAM | CPU | Notas |
|----------|-----|-----|-------|
| MySQL | ~300MB | ~20% | Picos al iniciar |
| Backend | ~250MB | ~15% | Picos con requests |
| Frontend | ~50MB | ~5% | Muy ligero |
| **Total** | **~600MB** | **~40%** | Deja espacio para sistema |

Quedan **~3.4GB libres** para el sistema operativo y otros procesos.

---

## 📝 Checklist de deployment

- [ ] Docker y Docker Compose instalados
- [ ] Proyecto clonado en Raspberry
- [ ] JWT_SECRET configurado en .env
- [ ] Contenedores levantados con `docker-compose up -d`
- [ ] Base de datos inicializada con Prisma
- [ ] Datos de prueba cargados (opcional)
- [ ] Accesible desde navegador
- [ ] Backup automático configurado
- [ ] Temperatura monitoreada (<70°C)

---

## ✅ ¡Todo listo!

GoHabit con MySQL está funcionando en tu Raspberry Pi 🎉

**Accede en:**
- Local: `http://localhost`
- Red local: `http://192.168.1.XX` (cambiar XX)

**Usuario admin por defecto:**
- Email: `admin@gohabit.com`
- Password: `password123`

⚠️ **IMPORTANTE**: Cambiar contraseñas en producción

---

## 📚 Más información

- [Documentación Prisma](./GoHabit-system/backend/prisma/README.md)
- [Configuración MySQL](./GoHabit-system/mysql/conf.d/raspberry.cnf)
- [Guía de queries](./GoHabit-system/backend/prisma/QUERY_CHEATSHEET.md)

---

*Última actualización: Marzo 2026*
