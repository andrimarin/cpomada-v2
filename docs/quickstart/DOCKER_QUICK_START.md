# ⚡ DOCKER QUICK START - 5 MINUTOS

La forma más rápida de ejecutar todo.

---

## OPCIÓN 1: Script Automático (Recomendado)

```bash
# Una sola línea
chmod +x scripts/docker-setup.sh && ./scripts/docker-setup.sh
```

**Eso es todo.** El script:
- ✅ Instala Docker si no lo tienes
- ✅ Crea .env
- ✅ Genera certificado SSL
- ✅ Inicia todos los servicios
- ✅ Espera a que todo esté listo

**Resultado:** Todo corriendo en 2 minutos

---

## OPCIÓN 2: Comandos Manuales

### Paso 1: Instalar Docker

**Ubuntu/Debian:**
```bash
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
exec su -l $USER
```

**macOS:**
```bash
brew install docker docker-compose
```

### Paso 2: Ejecutar

```bash
cd cpomada-v2
docker-compose up -d
```

### Paso 3: Verificar

```bash
curl http://localhost:3000/health
```

---

## ACCESO

```
🌐 Frontend:    http://localhost:3000
📊 API:         http://localhost:3000/api/v1/plans
💾 Base Datos:  localhost:3306 (usuario: portal_user)
```

---

## VER LOGS

```bash
# Todo
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo BD
docker-compose logs -f mariadb
```

---

## DETENER

```bash
# Parar pero guardar todo
docker-compose stop

# Eliminar completamente
docker-compose down

# Eliminar incluyendo BD
docker-compose down -v
```

---

## ACCEDER AL CONTENEDOR

```bash
# Terminal en backend
docker-compose exec backend sh

# Ejecutar comando en BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment -e "SELECT * FROM plans;"
```

---

## TROUBLESHOOTING RÁPIDO

```bash
# Puerto 3000 ocupado
docker-compose down
lsof -ti:3000 | xargs kill -9
docker-compose up -d

# Ver estado
docker-compose ps

# Recrear todo
docker-compose down -v
docker-compose up -d
```

---

## PRÓXIMOS PASOS

Después de que esté corriendo:

1. **Edita .env con tus credenciales**
   ```bash
   nano .env
   ```

2. **Prueba los endpoints**
   ```bash
   curl http://localhost:3000/api/v1/plans
   ```

3. **Lee la guía completa**
   ```bash
   cat DOCKER_GUIDE.md
   ```

---

## CHEAT SHEET

```bash
# Iniciar
docker-compose up -d

# Ver
docker-compose ps
docker-compose logs -f

# Parar
docker-compose stop

# Borrar
docker-compose down -v

# Acceder
docker-compose exec backend sh
docker-compose exec mariadb bash

# Rebuildar
docker-compose build backend
docker-compose up -d
```

---

**¡Listo!** Tu portal está corriendo. 🚀

Más detalles: DOCKER_GUIDE.md