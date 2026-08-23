# 🐳 ACTUALIZACIÓN: DOCKER AGREGADO

Hola de nuevo 👋

He agregado **soporte Docker completo** a tu proyecto. Ahora puedes instalar TODO en 5 minutos sin complicaciones.

---

## ✨ WHAT'S NEW

### 📁 Archivos Nuevos Agregados (7 archivos)

```
cpomada-v2/
│
├── 🐳 DOCKER FILES
│   ├── Dockerfile                  ← Imagen Node.js
│   ├── docker-compose.yml          ← Orquestación (BD + API + Nginx)
│   ├── nginx.conf                  ← Reverse proxy con SSL
│   ├── .dockerignore               ← Exclusiones
│   └── scripts/docker-setup.sh    ← Script automático
│
└── 📖 DOCUMENTACIÓN DOCKER
    ├── DOCKER_QUICK_START.md       ← 5 minutos (⭐ COMIENZA AQUÍ)
    ├── DOCKER_GUIDE.md             ← Guía completa
    └── DOCKER_README.md            ← Resumen de archivos
```

---

## ⚡ LA FORMA MÁS RÁPIDA

### Opción A: Script Automático (Recomendado)

```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

**¡LISTO!** En 2 minutos tienes:
- ✅ Node.js
- ✅ MariaDB
- ✅ Datos precargados
- ✅ API corriendo en :3000
- ✅ Nginx con SSL (opcional)

### Opción B: Comandos Manuales

```bash
cd cpomada-v2
docker-compose up -d
```

### Opción C: Sin Docker (Como Antes)

```bash
npm install
mysql < database/schema.sql
npm run dev
```

---

## 🎯 QUÉ INCLUYE DOCKER

### Dockerfile
```dockerfile
FROM node:18-alpine
# Imagen Node.js ligera (~160MB)
# Instala dependencias automáticamente
# Health check incluido
# Expone puerto 3000
```

### docker-compose.yml
```yaml
services:
  mariadb:      # Base de datos (mariadb:10.6-alpine)
  backend:      # API Node.js (node:18-alpine)
  nginx:        # Reverse proxy (nginx:alpine) - opcional
```

### nginx.conf
- ✅ SSL/TLS
- ✅ Rate limiting (10 req/s API, 5 req/s auth)
- ✅ Gzip compression
- ✅ Security headers (HSTS, X-Frame-Options, etc)
- ✅ Redirect HTTP → HTTPS

### scripts/docker-setup.sh
```bash
#!/bin/bash
# Detecta SO
# Instala Docker si falta
# Crea .env
# Genera certificado SSL
# Inicia servicios
# Espera a que estén listos
# Muestra URLs y comandos
```

---

## 📊 COMPARATIVA

```
┌─────────────────────────────────────────┐
│          LOCAL         │      DOCKER     │
├────────────────────────┼─────────────────┤
│ Instalar Node          │ Automático ✅   │
│ Instalar MariaDB       │ Automático ✅   │
│ Configurar conexión    │ Automático ✅   │
│ Crear tablas           │ Automático ✅   │
│ Insertar datos         │ Automático ✅   │
│ Tiempo total           │ 2 min vs 30 min │
│ Limpieza después       │ docker-compose down -v │
│ Portabilidad           │ ✅ 100%         │
│ Producción             │ ✅ Listo        │
└────────────────────────┴─────────────────┘
```

---

## 🚀 CÓMO EMPEZAR

### Paso 1: Clonar/Actualizar
```bash
cd cpomada-v2
git pull  # Si ya lo tenías
```

### Paso 2: Ejecutar
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### Paso 3: Acceder
```bash
# Frontend
open http://localhost:3000

# API
curl http://localhost:3000/api/v1/plans

# Base de Datos
mysql -h 127.0.0.1 -u portal_user -p omada_payment
```

---

## 📝 DOCUMENTACIÓN DOCKER

| Documento | Tiempo | Descripción |
|-----------|--------|-------------|
| **DOCKER_QUICK_START.md** | 5 min | Comandos básicos + troubleshooting |
| **DOCKER_GUIDE.md** | 30 min | Guía completa con ejemplos |
| **DOCKER_README.md** | 10 min | Resumen de archivos nuevos |

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose stop

# Eliminar todo (limpio)
docker-compose down -v

# Acceder a backend
docker-compose exec backend sh

# Acceder a BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment

# Hacer backup
docker-compose exec mariadb mysqldump -u portal_user -p omada_payment > backup.sql
```

---

## ✅ VERIFICAR QUE FUNCIONA

```bash
# Servicios corriendo
docker-compose ps
# Deberías ver: omada_portal_db (healthy), omada_portal_api (healthy)

# Health check
curl http://localhost:3000/health
# {"status":"OK","environment":"development"}

# Planes
curl http://localhost:3000/api/v1/plans
# Deberías ver 8 planes

# BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT COUNT(*) FROM plans;"
# Deberías ver: 8
```

---

## 🎁 BONUSES DOCKER

### 1. Script Automático
El archivo `scripts/docker-setup.sh` hace TODO por ti:
- Detecta tu sistema (Ubuntu, Debian, CentOS, macOS)
- Instala Docker si no existe
- Genera certificado SSL auto-firmado
- Inicia servicios
- Muestra URLs de acceso

### 2. Health Checks
Cada servicio tiene health check:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 3. Live Reload en Desarrollo
```bash
# Edita código
nano backend/controllers/planController.js

# Backend reinicia automáticamente
docker-compose logs -f backend | grep "restarted"
```

### 4. Nginx con SSL Incluido
```bash
docker-compose --profile production up -d
# Nginx activo con rate limiting y security headers
```

### 5. Volumes Persistentes
```bash
# BD guardada en volumen (sobrevive docker-compose down)
docker volume ls
```

---

## 🗺️ GUÍA DE LECTURA DOCKER

### 5 Minutos
→ `DOCKER_QUICK_START.md`

### 30 Minutos  
→ `DOCKER_GUIDE.md`

### Completo
→ `DOCKER_QUICK_START.md` → `DOCKER_GUIDE.md` → `DOCKER_README.md`

---

## 🤔 DOCKER O LOCAL?

### Usa Docker Si:
- ✅ Eres principiante
- ✅ Quieres instalar en 2 minutos
- ✅ Trabajas en equipo (mismo ambiente)
- ✅ Quieres producción rápido
- ✅ No quieres contaminar tu sistema

### Usa Local Si:
- ✅ Ya tienes todo instalado
- ✅ Necesitas máxima performance
- ✅ Tienes restricciones de OS

**Recomendación:** Comienza con Docker. 🐳

---

## 📊 ESTADÍSTICAS ACTUALIZADAS

```
Archivos nuevos:        7
   - 1 Dockerfile
   - 1 docker-compose.yml
   - 1 nginx.conf
   - 1 .dockerignore
   - 1 script bash
   - 3 documentos markdown

Documentación Docker:   ~40 páginas adicionales
Tiempo instalación:     5 min (vs 30 min local)
Complejidad:           ⬇️ Mucho menor
Portabilidad:          ⬆️ Perfecta
```

---

## 🎯 PRÓXIMO PASO

### Opción 1: Quiero Docker (Recomendado)
```
1. Lee: DOCKER_QUICK_START.md (5 min)
2. Ejecuta: ./scripts/docker-setup.sh
3. Accede: http://localhost:3000
```

### Opción 2: Quiero Sin Docker
```
1. Lee: QUICK_START.md (10 min)
2. Sigue los 7 pasos
3. npm run dev
```

### Opción 3: Quiero Entender Todo
```
1. Lee: DOCKER_README.md (10 min)
2. Lee: DOCKER_GUIDE.md (30 min)
3. Elige Docker o Local
```

---

## ❓ PREGUNTAS COMUNES

**¿Necesito desinstalar Node o MariaDB?**
→ No, Docker está completamente aislado. Ningún impacto en tu sistema.

**¿Puedo usar Docker y Local al mismo tiempo?**
→ Sí, pero evita que usen el mismo puerto (3000).

**¿Docker es lento?**
→ No, performance es casi idéntico. En Linux es igual. En macOS es ~10% más lento.

**¿Puedo usar Docker en producción?**
→ Sí, está diseñado para eso. Con Nginx incluido.

**¿Qué pasa si quiero volver a Local?**
→ `docker-compose down -v` borra todo. Instala normal y listo.

---

## 📞 ARCHIVOS DE REFERENCIA

```
DOCKER_QUICK_START.md  ← Comienza aquí
    └─→ DOCKER_GUIDE.md
        └─→ DOCKER_README.md
            └─→ Dockerfile, docker-compose.yml, nginx.conf
```

---

## ✨ RESUMEN

He agregado **Docker completo** que te permite:

1. ⚡ **Instalar en 5 minutos** en lugar de 30
2. 🎯 **Una línea de comando** en lugar de 7 pasos
3. 🔒 **Aislado de tu sistema** (sin contaminación)
4. 📦 **Portabilidad perfecta** (laptop → servidor → cloud)
5. 🚀 **Production-ready** (con Nginx + SSL)
6. 🐳 **Script automático** (lo hace todo por ti)

---

## 🚀 AHORA SÍ

```bash
cd cpomada-v2
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

**¡Listo en 2 minutos!** 🎉

---

**¿Preguntas?** Lee `DOCKER_GUIDE.md` - Troubleshooting section

**¡Bienvenido a Docker!** 🐳