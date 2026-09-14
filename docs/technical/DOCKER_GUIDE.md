# 🐳 DOCKER GUIDE - Portal Cautivo Omada

Guía completa para instalar y ejecutar todo con Docker.

---

## ¿POR QUÉ DOCKER?

```
✅ Una línea: npm install, setup BD, etc. automatizado
✅ Aislamiento: No interfiere con tu sistema
✅ Portabilidad: Corre igual en laptop, servidor, cloud
✅ Escalabilidad: Fácil agregar más instancias
✅ Reproducibilidad: Mismo ambiente en todas partes
✅ Limpieza: docker-compose down y todo desaparece
```

---

## INSTALACIÓN RÁPIDA (3 PASOS)

### Paso 1: Instalar Docker

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Reinicia sesión o ejecuta: exec su -l $USER
```

**macOS:**
```bash
# Descarga Docker Desktop desde https://www.docker.com/products/docker-desktop
# O usa Homebrew
brew install docker docker-compose
```

**Windows:**
```bash
# Descarga Docker Desktop desde https://www.docker.com/products/docker-desktop
```

**Verificar:**
```bash
docker --version
docker-compose --version
```

### Paso 2: Configurar Variables de Entorno

```bash
cd cpomada-v2
cp .env.example .env
nano .env

# Edita con tus valores (mínimo para pruebas):
# DB_PASSWORD=tu_contraseña
# MERCANTIL_MERCHANT_ID=123456
# OMADA_SITE_ID=tu_site
```

### Paso 3: Ejecutar

```bash
# Opción A: Script automático (recomendado)
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh

# Opción B: Manual
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**¡Listo!** Accede a: http://localhost:3000

---

## ARQUITETURA DOCKER

```
┌─────────────────────────────────────────┐
│        DOCKER COMPOSE                    │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Backend  │  │ MariaDB  │  │ Nginx  │ │
│  │ Node.js  │  │ (BD)     │  │ (SSL)  │ │
│  │ :3000    │  │ :3306    │  │ :443   │ │
│  └──────────┘  └──────────┘  └────────┘ │
│        │              │            │     │
│        └──────────────┼────────────┘     │
│                       │                  │
│                 omada_network            │
│                                          │
└─────────────────────────────────────────┘
```

---

## ARCHIVO: docker-compose.yml

```yaml
version: '3.8'

services:
  mariadb:         # Base de datos
  backend:         # API Node.js
  nginx:           # Reverse proxy (opcional)
```

**3 servicios, totalmente orquestados.**

---

## COMANDOS PRINCIPALES

### Iniciar

```bash
# Iniciar en background
docker-compose up -d

# Iniciar viendo logs en tiempo real
docker-compose up

# Iniciar un servicio específico
docker-compose up -d mariadb
```

### Ver Estado

```bash
# Ver contenedores corriendo
docker-compose ps

# Ver logs
docker-compose logs           # Todos
docker-compose logs backend   # Solo backend
docker-compose logs -f        # Follow (tiempo real)
docker-compose logs --tail=100 backend  # Últimas 100 líneas
```

### Parar

```bash
# Parar servicios (guardan estado)
docker-compose stop

# Parar y eliminar todo
docker-compose down

# Parar y eliminar volúmenes (BD completa)
docker-compose down -v
```

### Acceder a Servicios

```bash
# Terminal en backend
docker-compose exec backend sh

# Terminal en BD
docker-compose exec mariadb bash

# Ejecutar comando en BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT * FROM plans;"

# Ver variables entorno
docker-compose exec backend env | grep DB
```

### Rebuild

```bash
# Reconstruir imagen backend (después de cambios)
docker-compose build backend

# Reconstruir todo
docker-compose build

# Reconstruir sin caché
docker-compose build --no-cache
```

---

## ACCESO A SERVICIOS

| Servicio | Puerto | URL | Usuario | Contraseña |
|----------|--------|-----|---------|-----------|
| Backend API | 3000 | http://localhost:3000 | - | - |
| MariaDB | 3306 | localhost:3306 | portal_user | (del .env) |
| Nginx HTTP | 80 | http://localhost | - | - |
| Nginx HTTPS | 443 | https://localhost | - | - |

---

## VERIFICAR QUE FUNCIONA

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development"
}
```

### 2. Planes

```bash
curl http://localhost:3000/api/v1/plans
```

**Deberías ver 8 planes precargados.**

### 3. Base de Datos

```bash
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT COUNT(*) FROM plans;"
```

**Deberías ver: 8**

---

## PERSISTENCIA DE DATOS

### Base de Datos

Los datos se guardan en volumen Docker `mariadb_data`:

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect cpomada-v2_mariadb_data

# Backup manual
docker-compose exec mariadb mysqldump -u portal_user -p omada_payment > backup.sql

# Restaurar
docker-compose exec -T mariadb mysql -u portal_user -p omada_payment < backup.sql
```

### Código

El código en `backend/` está montado en vivo:

```bash
# Edita un archivo
nano backend/controllers/planController.js

# Los cambios se reflejan automáticamente en desarrollo
# (requiere nodemon, que ya está configurado)
```

---

## DESARROLLO CON DOCKER

### Modo Desarrollo (Hot Reload)

```bash
# Backend monta volumen y usa nodemon
docker-compose up -d backend

# Edita código
nano backend/controllers/planController.js

# Los cambios se aplican automáticamente
docker-compose logs -f backend | grep "restarted"
```

### Agregar Dependencias

```bash
# Dentro del contenedor
docker-compose exec backend npm install express-new-package

# O editando package.json y rebuilding
docker-compose build backend
docker-compose up -d backend
```

### Debugging

```bash
# Ver logs en vivo
docker-compose logs -f backend

# Ver específicamente errores
docker-compose logs backend | grep -i error

# Acceder al contenedor
docker-compose exec backend sh

# Dentro: ver procesos
ps aux
```

---

## PRODUCCIÓN CON DOCKER

### Variables de Entorno

Crear `.env.production`:

```env
NODE_ENV=production
DB_PASSWORD=contraseña_fuerte_aleatoria
MERCANTIL_CONTROLLER_TYPE=production
MERCANTIL_CLIENT_ID_PROD=tu_client_id_prod
MERCANTIL_MERCHANT_ID=tu_merchant_id
MERCANTIL_TERMINAL_ID=tu_terminal_id
OMADA_SITE_ID=tu_site_id_prod
```

### Ejecutar Producción

```bash
# Con archivo .env.production
env $(cat .env.production | xargs) docker-compose up -d

# O crear docker-compose.prod.yml específico
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Nginx + SSL

El `docker-compose.yml` incluye Nginx opcional:

```bash
# Activar Nginx (producción)
docker-compose --profile production up -d

# Generar certificado SSL real (Let's Encrypt)
docker run --rm -it -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d tu-dominio.com

# Copiar certificados a ssl/
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem

# Reiniciar Nginx
docker-compose restart nginx
```

### Backups Automáticos

```bash
# Script de backup diario
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mariadb mysqldump \
  -u portal_user -p omada_payment \
  > /backups/omada_$TIMESTAMP.sql

# Agregar a crontab
0 2 * * * /home/user/omada-portal/backup.sh
```

---

## MONITOREO

### Health Checks

Los servicios tienen health checks automáticos:

```bash
# Ver health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Debería mostrar:
```
omada_portal_db     Up X minutes (healthy)
omada_portal_api    Up X minutes (healthy)
```

### Logs Centralizados

```bash
# Ver todo
docker-compose logs

# Timestamp
docker-compose logs --timestamps

# Últimas N líneas
docker-compose logs --tail 50

# Exportar a archivo
docker-compose logs > docker.log
```

---

## TROUBLESHOOTING

### Puerto Ya en Uso

```bash
# Puerto 3000 ocupado
# Cambiar en docker-compose.yml
ports:
  - "3001:3000"  # Usar 3001 en lugar de 3000

# O matar proceso
sudo lsof -ti:3000 | xargs kill -9
```

### BD No Conecta

```bash
# Ver logs BD
docker-compose logs mariadb

# Recrear BD
docker-compose down -v
docker-compose up -d mariadb

# Esperar a que esté lista
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SHOW TABLES;"
```

### Permiso Denegado

```bash
# Agregar usuario a grupo docker
sudo usermod -aG docker $USER
exec su -l $USER
```

### Memoria Insuficiente

```bash
# Ver uso
docker stats

# Limitar recursos en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## SCALING

### Múltiples Instancias Backend

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3  # 3 instancias
```

```bash
docker-compose up -d --scale backend=3
```

### Load Balancer

Nginx se distribuye automáticamente entre instancias:

```nginx
upstream backend {
    server backend:3000;
    server backend:3001;
    server backend:3002;
}
```

---

## INTEGRACIÓN CI/CD

### GitLab CI

```yaml
# .gitlab-ci.yml
docker_build:
  stage: build
  script:
    - docker-compose build backend
  only:
    - main
```

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker-compose build
```

---

## COMANDOS ÚTILES

```bash
# Limpiar todo (⚠️ destructivo)
docker-compose down -v
docker system prune -a

# Ver estadísticas de recursos
docker stats

# Copiar archivo del contenedor
docker cp omada_portal_api:/app/logs/app.log ./

# Ejecutar comando sin iniciar sesión interactiva
docker-compose exec -T backend npm test

# Reiniciar un servicio
docker-compose restart backend

# Actualizar imagen
docker pull node:18-alpine
docker-compose up -d --force-recreate backend
```

---

## COMPARATIVA: Local vs Docker

| Aspecto | Local | Docker |
|---------|-------|--------|
| Instalación | 30 min | 3 min |
| Setup BD | Manual | Automático |
| Dependencias | Sistema | Contenedor |
| Aislamiento | Bajo | Alto |
| Portabilidad | Baja | Alta |
| Limpieza | Difícil | `docker-compose down` |
| Escalabilidad | Difícil | Fácil |
| Performance | ↑ | ↓ pequeño |

---

## RECURSOS

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- Best Practices: https://docs.docker.com/develop/dev-best-practices
- MariaDB Docker: https://hub.docker.com/_/mariadb

---

## ¿DOCKER O LOCAL?

### Usa Docker si:
- ✅ Eres principiante (menos configuración)
- ✅ Necesitas portabilidad
- ✅ Trabajas en equipo
- ✅ Quieres producción rápido

### Usa Local si:
- ✅ Ya tienes todo instalado
- ✅ Necesitas máxima performance
- ✅ Haces debugging profundo
- ✅ Tienes restricciones de SO

---

**Recomendación:** Comienza con Docker. Es más rápido. 🐳

Sigue: DOCKER_QUICK_START.md para los primeros 10 minutos con Docker.