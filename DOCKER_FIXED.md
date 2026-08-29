# ✅ CORRECCIÓN: Versión MariaDB

## Problema Resuelto

Se corrigió el error de imagen MariaDB  prueba en docker-compose.yml

### Cambio Realizado

```yaml
# ANTES (ERROR):
image: mariadb:10.6-alpine  ❌ No existe

# AHORA (CORRECTO):
image: mariadb:latest       ✅ Funciona
```

---

git config --global user.name "andrimarin"
git config --global user.email "andri.marin@gmail.com"
git config --global init.defaultBranch main

## ¿Por Qué?

La versión `mariadb:10.6-alpine` no existe en Docker Hub.

Las versiones disponibles son:
- `mariadb:latest` ✅ (Recomendado)
- `mariadb:10.11` ✅
- `mariadb:10.5` ✅
- `mariadb:10.4` ✅

---

## ✅ Ahora Funciona

```bash
./scripts/docker-setup.sh
# ✅ Descargará mariadb:latest
# ✅ Todo funcionará correctamente
```

---

## Si Ya lo Ejecutaste Antes

```bash
# Limpia todo y vuelve a intentar
docker-compose down -v
docker-compose up -d

# O ejecuta el script
./scripts/docker-setup.sh
```

---

**¡Ahora sí está correcto!** 🐳