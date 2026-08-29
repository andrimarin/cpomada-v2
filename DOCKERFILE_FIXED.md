# ✅ CORRECCIÓN: Error en Dockerfile

## Problema Resuelto

Se corrigió el error en la instalación de dependencias del Dockerfile.

---

## El Error

```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Causa**: Faltaba `package-lock.json`

---

## La Solución

### Cambio en Dockerfile

```dockerfile
# ANTES (ERROR):
RUN npm ci --only=production

# AHORA (CORRECTO):
RUN npm install --production
```

---

## ✅ Ahora Funciona

```bash
# Limpia construcción anterior
docker-compose down -v

# Reconstruye
docker-compose build backend

# Ejecuta
./scripts/docker-setup.sh
```

---

## ¿Por Qué?

- `npm ci` requiere `package-lock.json` (seguridad)
- `npm install --production` funciona sin él (instalación normal)
- Ambos funcionan, pero `npm install` es más flexible

---

## 🚀 Próximo Paso

```bash
./scripts/docker-setup.sh
```

**Ahora debería funcionar correctamente.** ✅

---

Si vuelve a fallar:
```bash
# Opción nuclear: Limpia todo
docker system prune -a
docker-compose down -v

# Vuelve a intentar
./scripts/docker-setup.sh
```