# ⚡ BUILD LENTO - SOLUCIONADO

## Causa

`npm install` dentro del contenedor se quedaba esperando la red (timeout largo por defecto),
especialmente si hay firewall/proxy o DNS lento hacia registry.npmjs.org.

## Fix Aplicado en Dockerfile

```dockerfile
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set registry https://registry.npmjs.org/

RUN npm install --production --no-audit --no-fund --prefer-offline
```

Esto hace que npm falle rápido y reintente, en vez de colgarse indefinidamente.

---

## 🚀 Pasos para Rebuild Rápido

```bash
cd /home/pescador/Documents/programacion/portalc4/cpomada-v2

# 1. Verificar conectividad básica (evita perder tiempo si no hay red)
curl -I https://registry.npmjs.org/ --max-time 5

# 2. Build con BuildKit (más rápido, mejor caché)
DOCKER_BUILDKIT=1 docker-compose build backend

# 3. Si sigue lento, prueba con --progress=plain para ver en qué paso se traba
DOCKER_BUILDKIT=1 docker-compose build --progress=plain backend
```

---

## 🐢 Si Sigue Muy Lento

### Opción A: Generar package-lock.json localmente primero (evita resolver versiones dentro del contenedor)

```bash
cd cpomada-v2
npm install --package-lock-only
# Esto crea package-lock.json sin instalar node_modules localmente
```

Luego en el Dockerfile puedes cambiar a `npm ci` (más rápido y determinista):

```dockerfile
RUN npm ci --production --no-audit --no-fund
```

### Opción B: Usar un registry espejo más rápido (si estás en LATAM)

```dockerfile
RUN npm config set registry https://registry.npmmirror.com/
```

### Opción C: Verificar que no estés limitado por CPU/RAM del host

```bash
docker stats
# Si CPU/RAM están al límite, cierra otros contenedores o aumenta recursos de Docker Desktop
```

---

## ✅ Verificar que Terminó Bien

```bash
docker-compose up -d
docker-compose logs -f backend
```

Deberías ver en segundos:
```
✅ Frontend encontrado en: /app/frontend
✅ Ruta /api/v1/plans cargada
✅ Servidor corriendo en http://localhost:3000
```

---

## 💡 Tip Extra: Evitar Rebuilds Innecesarios

El orden de capas en el Dockerfile importa. Como `package*.json` se copia **antes** que el código,
Docker reutiliza la capa de `npm install` mientras no cambies dependencias — solo se reinstala si
modificas `package.json`. Si cambiaste solo código en `backend/` o `frontend/`, el build debería
tardar segundos, no minutos.

Si aun así reconstruye todo desde cero cada vez, revisa que no estés usando `--no-cache` sin necesidad:

```bash
# Build normal (usa caché) — rápido
docker-compose build backend

# Solo usa --no-cache si sospechas caché corrupta
docker-compose build --no-cache backend
```
