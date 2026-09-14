# Índice Maestro de Documentación

**Portal Cautivo Omada V2 - Septiembre 2026**

---

## 📚 Documentos Principales

| Documento | Ubicación | Propósito | Tiempo |
|-----------|-----------|-----------|--------|
| **README.md** | `/README.md` | Punto de entrada principal | 5 min |
| **ESTADO_ACTUAL.md** | `/ESTADO_ACTUAL.md` | Resumen ejecutivo del proyecto | 5 min |
| **ANALISIS_PROYECTO.md** | `/ANALISIS_PROYECTO.md` | Análisis completo y plan | 15 min |
| **CHANGELOG.md** | `/CHANGELOG.md` | Historial de cambios | 5 min |

---

## 📘 Documentación por Categoría

### 📊 Base Teórica (Negocio)
**Ubicación**: `docs/business/`

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| [PROPUESTA_FINAL.md](business/PROPUESTA_FINAL.md) | Resumen ejecutivo, ROI, proyecciones | Ejecutivos, Gerentes |
| [README_FINAL.md](business/README_FINAL.md) | Propuesta completa, características | Todos |
| [VISUAL_SUMMARY.md](business/VISUAL_SUMMARY.md) | Diagramas, estadísticas visuales | Presentaciones |

**Cuándo usar**: Para entender el negocio, presentar a stakeholders, planificar estrategia

---

### 🛠️ Guías Técnicas
**Ubicación**: `docs/technical/`

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| [IMPLEMENTATION_PLAN.md](technical/IMPLEMENTATION_PLAN.md) | Plan de 8 fases, timeline | Planificadores, DevOps |
| [IMPLEMENTATION_GUIDE.md](technical/IMPLEMENTATION_GUIDE.md) | Guía técnica paso a paso | Desarrolladores, DBA |
| [DOCKER_GUIDE.md](technical/DOCKER_GUIDE.md) | Docker completo, comandos | DevOps, SysAdmins |

**Cuándo usar**: Para implementar, configurar, desplegar

---

### ⚡ Inicio Rápido
**Ubicación**: `docs/quickstart/`

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| [START_HERE.md](quickstart/START_HERE.md) | Punto de entrada, navegación | 5 min |
| [DOCKER_QUICK_START.md](quickstart/DOCKER_QUICK_START.md) | Docker en 5 minutos | 5 min |
| [QUICK_START.md](quickstart/QUICK_START.md) | Instalación local rápida | 10 min |
| [INDEX.md](quickstart/INDEX.md) | Mapa de documentación | 10 min |

**Cuándo usar**: Para empezar rápidamente, primeras pruebas

---

### 📝 Historial de Cambios (Changelog)
**Ubicación**: `docs/changelog/`

| Documento | Problema Resuelto | Fecha |
|-----------|-------------------|-------|
| [FIX_ROOT_CAUSE.md](changelog/FIX_ROOT_CAUSE.md) | Rutas no cargaban | 2026-09 |
| [FRONTEND_FIXED.md](changelog/FRONTEND_FIXED.md) | Frontend no encontrado | 2026-09 |
| [FRONTEND_LIVE.md](changelog/FRONTEND_LIVE.md) | Frontend activo | 2026-09 |
| [DOCKER_FIXED.md](changelog/DOCKER_FIXED.md) | Imagen MariaDB incorrecta | 2026-09 |
| [DOCKERFILE_FIXED.md](changelog/DOCKERFILE_FIXED.md) | Error npm ci | 2026-09 |
| [BUILD_SLOW_FIXED.md](changelog/BUILD_SLOW_FIXED.md) | Build lento | 2026-09 |
| [DOCKER_COMPLETE.md](changelog/DOCKER_COMPLETE.md) | Docker completado | 2026-09 |
| [DOCKER_README.md](changelog/DOCKER_README.md) | Referencia Docker | 2026-09 |
| [DOCKER_UPDATE.md](changelog/DOCKER_UPDATE.md) | Actualización Docker | 2026-09 |
| [DOCKER_WELCOME.md](changelog/DOCKER_WELCOME.md) | Bienvenida Docker | 2026-09 |

**Cuándo usar**: Para entender problemas resueltos, debugging

---

### 📚 Referencias Externas
**Ubicación**: `docs/external/`

| Documento | Propósito |
|-----------|-----------|
| [vps-ssh-rsync-guide.md](external/vps-ssh-rsync-guide.md) | Guía SSH/rsync a VPS AWS |

**Cuándo usar**: Para conectar a servidores remotos

---

## 🗺️ Rutas de Aprendizaje

### 👨‍💻 Desarrollador Backend
```
1. ESTADO_ACTUAL.md ........... 5 min (Visión general)
2. docs/quickstart/QUICK_START.md .. 10 min (Instalar)
3. docs/technical/IMPLEMENTATION_GUIDE.md .. 60 min (Técnica)
4. backend/ ................... ∞ (Estudiar código)
TOTAL: ~90 minutos
```

### 🗄️ Administrador BD
```
1. ESTADO_ACTUAL.md ........... 5 min (Visión general)
2. database/schema.sql ........ 15 min (Estructura)
3. database/seed.sql .......... 10 min (Datos)
4. docs/technical/IMPLEMENTATION_GUIDE.md .. 30 min (Operación)
TOTAL: ~60 minutos
```

### 🚀 DevOps/Infra
```
1. ESTADO_ACTUAL.md ........... 5 min (Visión general)
2. docs/technical/IMPLEMENTATION_PLAN.md .. 45 min (Plan)
3. docs/technical/DOCKER_GUIDE.md ....... 30 min (Docker)
4. docs/technical/IMPLEMENTATION_GUIDE.md .. 30 min (Deployment)
TOTAL: ~2 horas
```

### 📊 Gerente/Business
```
1. ESTADO_ACTUAL.md ........... 5 min (Resumen)
2. docs/business/PROPUESTA_FINAL.md .. 30 min (Ejecutiva)
3. docs/business/README_FINAL.md ..... 30 min (Detalles)
TOTAL: ~65 minutos
```

### ⚡ Solo quiero empezar
```
1. docs/quickstart/DOCKER_QUICK_START.md .. 5 min (Instalar)
2. Probar localmente ........ 5 min
3. ESTADO_ACTUAL.md ......... 5 min (Contexto)
TOTAL: ~15 minutos
```

---

## 🔍 Búsqueda por Tema

### Instalación y Setup
- **Docker**: `docs/quickstart/DOCKER_QUICK_START.md`
- **Local**: `docs/quickstart/QUICK_START.md`
- **Detallado**: `docs/technical/IMPLEMENTATION_GUIDE.md`
- **Plan completo**: `docs/technical/IMPLEMENTATION_PLAN.md`

### Arquitectura
- **Resumen**: `docs/business/README_FINAL.md`
- **Detallado**: `docs/technical/IMPLEMENTATION_GUIDE.md`
- **Código**: `backend/`

### Base de Datos
- **Schema**: `database/schema.sql`
- **Datos**: `database/seed.sql`
- **Queries**: `docs/technical/IMPLEMENTATION_GUIDE.md`

### APIs
- **Endpoints**: `docs/technical/IMPLEMENTATION_GUIDE.md`
- **Ejemplos**: `examples/`
- **Bancomercantil**: `examples/api-mercantil.json`

### Seguridad
- **Encriptación**: `examples/example-encript.js`
- **Validaciones**: `backend/middleware/validation.js`
- **Consideraciones**: `docs/technical/IMPLEMENTATION_GUIDE.md`

### Docker
- **Rápido**: `docs/quickstart/DOCKER_QUICK_START.md`
- **Completo**: `docs/technical/DOCKER_GUIDE.md`
- **Referencia**: `docs/changelog/DOCKER_README.md`

### Troubleshooting
- **Fixes aplicados**: `docs/changelog/`
- **Guía técnica**: `docs/technical/IMPLEMENTATION_GUIDE.md`
- **Quick start**: `docs/quickstart/QUICK_START.md`

---

## 📊 Estadísticas de Documentación

```
Total documentos:        23 archivos *.md
Páginas estimadas:       ~80
Tiempo total lectura:    ~8 horas

Por categoría:
├── Base teórica:        3 documentos
├── Técnicas:            3 documentos
├── Quick start:         4 documentos
├── Changelog:           12 documentos
└── Externas:            1 documento
```

---

## 🎯 Recomendación según Rol

### Ejecutivo / Gerente
**Enfoque**: Negocio y ROI  
**Documentos clave**:
1. `ESTADO_ACTUAL.md`
2. `docs/business/PROPUESTA_FINAL.md`
3. `docs/business/VISUAL_SUMMARY.md`

### Desarrollador
**Enfoque**: Implementación técnica  
**Documentos clave**:
1. `ESTADO_ACTUAL.md`
2. `docs/quickstart/QUICK_START.md`
3. `docs/technical/IMPLEMENTATION_GUIDE.md`
4. `backend/` (código)

### DevOps
**Enfoque**: Deployment y operación  
**Documentos clave**:
1. `ESTADO_ACTUAL.md`
2. `docs/technical/DOCKER_GUIDE.md`
3. `docs/technical/IMPLEMENTATION_PLAN.md` (Fase 7)

### DBA
**Enfoque**: Base de datos  
**Documentos clave**:
1. `ESTADO_ACTUAL.md`
2. `database/schema.sql`
3. `docs/technical/IMPLEMENTATION_GUIDE.md` (sección BD)

---

## 🔄 Actualizaciones

**Última reorganización**: 2026-09-14  
**Versión documentación**: 2.1.0  
**Próxima revisión**: Después de completar tests

---

## 📞 Ayuda

**¿No encuentras algo?**
1. Revisa `ESTADO_ACTUAL.md` para visión general
2. Usa el buscador (Ctrl+F) en este índice
3. Consulta `docs/technical/IMPLEMENTATION_GUIDE.md` para detalles técnicos
4. Revisa `docs/changelog/` para problemas conocidos

**¿Nuevo en el proyecto?**
1. Lee `ESTADO_ACTUAL.md` (5 min)
2. Elige tu ruta de aprendizaje arriba
3. Sigue los documentos en orden

---

**Índice mantenido por**: Equipo de desarrollo  
**Última actualización**: 2026-09-14
