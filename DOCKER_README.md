# 🐳 DOCKER - Portal Cautivo Omada

Ejecuta todo con Docker en 3 pasos.

---

## ¿QUÉ ARCHIVOS NUEVOS SON ESTOS?

| Archivo | Descripción |
|---------|-------------|
| **Dockerfile** | Imagen para backend Node.js |
| **docker-compose.yml** | Orquesta todos los servicios |
| **nginx.conf** | Configuración reverse proxy (SSL, rate limit) |
| **scripts/docker-setup.sh** | Script automático para instalar y ejecutar |
| **.dockerignore** | Archivos a excluir de imagen |
| **DOCKER_QUICK_START.md** | Guía 5 minutos |
| **DOCKER_GUIDE.md** | Guía completa con ejemplos |

---

## 3 PASOS PARA EMPEZAR

### 1️⃣ Instalar Docker
```bash
# Ubuntu/Debian
sudo apt-get install docker.io docker-compose

# macOS
brew install docker docker-compose

# Verificar
docker --version && docker-compose --version
```

### 2️⃣ Ejecutar Script
```bash
cd cpomada-v2
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### 3️⃣ Acceder
```bash
# Frontend
open http://localhost:3000

# API
curl http://localhost:3000/api/v1/plans
```

---

## ¿QUÉ HACE EL SCRIPT?

```bash
./scripts/docker-setup.sh
```

Automáticamente:
1. ✅ Detecta sistema operativo
2. ✅ Instala Docker si no existe
3. ✅ Crea archivo .env
4. ✅ Genera certificado SSL
5. ✅ Inicia 3 servicios (BD, API, Nginx)
6. ✅ Espera a que estén listos
7. ✅ Muestra URLs de acceso
8. ✅ Proporciona comandos útiles

**Tiempo total: ~2 minutos** ⚡

---

## ARQUITECTURA

```
docker-compose.yml
├── mariadb (Base de datos)
│   ├── Imagen: mariadb:10.6-alpine
│   ├── Puerto: 3306
│   ├── Volumen: mariadb_data (persistente)
│   └── Inicializa: schema.sql + seed.sql
│
├── backend (Node.js API)
│   ├── Build: Dockerfile
│   ├── Puerto: 3000
│   ├── Volúmenes: backend/, resources/ (live)
│   └── Depends: mariadb
│
└── nginx (Reverse proxy - Opcional)
    ├── Imagen: nginx:alpine
    ├── Puertos: 80, 443
    ├── Config: nginx.conf
    └── Perfil: production
```

---

## SERVICIOS

### 1. Backend Node.js
- **Imagen**: node:18-alpine
- **Puerto**: 3000
- **Health Check**: /health endpoint
- **Live Reload**: Cambios reflejados automáticamente

### 2. MariaDB
- **Imagen**: mariadb:10.6-alpine
- **Puerto**: 3306
- **Volumen**: Datos persistentes
- **Inicialización**: Automática con schema + seed

### 3. Nginx (Opcional)
- **Imagen**: nginx:alpine
- **Puertos**: 80, 443
- **Funciones**: SSL, Rate Limiting, Security Headers
- **Activación**: `--profile production`

---

## COMANDOS CLAVE

### Ver Estado
```bash
docker-compose ps                  # Servicios corriendo
docker-compose logs -f             # Logs en vivo
docker-compose logs backend        # Solo backend
docker-compose logs --tail 50      # Últimas 50 líneas
```

### Control
```bash
docker-compose up -d               # Iniciar
docker-compose stop                # Parar
docker-compose restart backend     # Reiniciar backend
docker-compose down                # Eliminar
docker-compose down -v             # Eliminar + BD
```

### Acceso
```bash
docker-compose exec backend sh     # Terminal en backend
docker-compose exec mariadb bash   # Terminal en BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT * FROM plans;"
```

### Desarrollo
```bash
docker-compose build backend       # Reconstruir (cambios code)
docker-compose up -d --force-recreate  # Forzar recrear
docker-compose logs -f backend | grep error  # Ver errores
```

---

## VERIFICAR QUE FUNCIONA

### 1. Servicios Corriendo
```bash
docker-compose ps
```

Deberías ver:
```
NAME                   STATUS
omada_portal_db        Up (healthy)
omada_portal_api       Up (healthy)
```

### 2. Health Check
```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{"status":"OK","environment":"development"}
```

### 3. Planes
```bash
curl http://localhost:3000/api/v1/plans
```

Deberías ver 8 planes en JSON.

### 4. Base de Datos
```bash
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT COUNT(*) as plans FROM plans;"
```

Deberías ver: `8`

---

## ACCESO

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Frontend | http://localhost:3000 | - |
| API | http://localhost:3000/api/v1/plans | - |
| Nginx | https://localhost | (si está activo) |
| MariaDB | localhost:3306 | portal_user / (en .env) |

---

## DESARROLLO

### Hot Reload
Backend usa `nodemon`, cambios se aplican automáticamente:

```bash
# Edita un archivo
nano backend/controllers/planController.js

# Cambios se aplican al instante
docker-compose logs -f backend | grep "restarted"
```

### Agregar Paquetes NPM
```bash
# Opción A: Dentro del contenedor
docker-compose exec backend npm install express-new-package

# Opción B: Editar package.json y rebuildar
docker-compose build backend
docker-compose up -d backend
```

### Debugging
```bash
docker-compose exec backend sh
cd /app
npm list
env | grep DB
ps aux
```

---

## PERSISTENCIA

### Base de Datos
Los datos se guardan en volumen `mariadb_data`:

```bash
# Ver volúmenes
docker volume ls

# Backup
docker-compose exec mariadb mysqldump -u portal_user -p omada_payment > backup.sql

# Restore
docker-compose exec -T mariadb mysql -u portal_user -p omada_payment < backup.sql
```

### Código
Backend y resources están montados como volúmenes, cambios reflejados en vivo.

---

## PRODUCCIÓN

### Con Nginx + SSL

```bash
# Activar Nginx
docker-compose --profile production up -d

# Certificado SSL (Let's Encrypt)
docker run --rm -it -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone -d tu-dominio.com

cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem

docker-compose restart nginx
```

### Monitoreo
```bash
docker stats                       # Recursos
docker-compose ps                 # Estado
docker-compose logs               # Logs
```

---

## TROUBLESHOOTING

### Puerto 3000 Ocupado
```bash
lsof -ti:3000 | xargs kill -9
docker-compose up -d
```

### BD No Conecta
```bash
docker-compose logs mariadb
docker-compose down -v
docker-compose up -d mariadb
```

### Permiso Denegado
```bash
sudo usermod -aG docker $USER
exec su -l $USER
```

### Reconstruir Todo
```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

---

## DOCUMENTACIÓN

- **5 minutos**: DOCKER_QUICK_START.md
- **Completa**: DOCKER_GUIDE.md
- **Técnica**: IMPLEMENTATION_GUIDE.md
- **Plan**: IMPLEMENTATION_PLAN.md

---

## COMPARATIVA: Docker vs Local

| Aspecto | Docker | Local |
|---------|--------|-------|
| **Instalación** | 5 min | 30 min |
| **Setup BD** | Automático | Manual |
| **Portabilidad** | ✅ Alta | ❌ Baja |
| **Aislamiento** | ✅ Alto | ❌ Bajo |
| **Performance** | ≈ Mismo | ↑ Ligeramente mejor |
| **Escalabilidad** | ✅ Fácil | ❌ Difícil |

---

## PRÓXIMOS PASOS

1. **Ejecuta script**: `./scripts/docker-setup.sh`
2. **Espera 2 minutos**
3. **Accede**: http://localhost:3000
4. **Lee**: DOCKER_GUIDE.md para más detalles

---

**¿Preguntas?** Ver DOCKER_GUIDE.md sección Troubleshooting 🐳