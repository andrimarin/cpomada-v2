# Changelog - Portal Cautivo Omada V2

Todos los cambios importantes en este proyecto serán documentados en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.2.0] - 2026-09-14

### Añadido
- **Controlador Omada completo** (`backend/controllers/omadaController.js`)
  - Autenticación con Omada Cloud/OC200
  - Autorización de clientes por MAC address
  - Desautenticación de clientes
  - Creación de sesiones WiFi con integración BD + Omada
  - Expiración automática de sesiones antiguas
  - Manejo de tokens con renovación automática
  - Soporte HTTPS con certificados self-signed

- **Sistema de autenticación JWT** (`backend/middleware/auth.js`)
  - Generación y verificación de tokens JWT
  - Middleware de autenticación
  - Middleware de verificación de rol admin
  - Login de administrador
  - Renovación de tokens (refresh)
  - Logout con auditoría
  - Registro de intentos fallidos

- **Rutas de autenticación** (`backend/routes/auth.js`)
  - POST /api/v1/auth/login
  - POST /api/v1/auth/verify
  - POST /api/v1/auth/refresh
  - POST /api/v1/auth/logout

- **Rutas de sesiones mejoradas**
  - GET /api/v1/sessions/active (admin)
  - POST /api/v1/sessions/expire (admin)
  - Verificación de sesión con tiempo restante
  - Historial de sesiones con límite configurable

- **Tests unitarios iniciales**
  - Tests para middleware de autenticación
  - Tests para generación/verificación de tokens

- **Variables de entorno**
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - ADMIN_USERNAME
  - ADMIN_PASSWORD

### Corregido
- **Webhook Bancomercantil mejorado**
  - Validación de firma/fuente del webhook
  - Verificación de Content-Type
  - Prevención de procesamiento duplicado
  - Integración con Omada para autorización automática
  - Manejo completo de errores con rollback
  - Búsqueda por payment_reference o transaction_id

- **Rutas protegidas**
  - POST/PUT/DELETE en /plans requieren autenticación admin
  - GET en /plans permanece público
  - Nuevas rutas admin para sesiones

### Seguridad
- ✅ Rutas admin protegidas con JWT
- ✅ Webhook con validación de fuente
- ✅ Autenticación completa con roles
- ✅ Auditoría de intentos fallidos
- ✅ Tokens con expiración configurable

### Técnico
- **Líneas de código añadidas**: ~830
- **Nuevos archivos**: 4 (omadaController, auth middleware, auth routes, tests)
- **Archivos modificados**: 5 (paymentController, plans routes, sessions routes, server.js, .env.example)

---

## [2.1.0] - 2026-09-14

### Añadido
- **Soporte Docker completo**
  - `Dockerfile` con Node.js 18 Alpine
  - `docker-compose.yml` con 3 servicios (MariaDB, Backend, Nginx)
  - `nginx.conf` con reverse proxy, SSL y rate limiting
  - `scripts/docker-setup.sh` para instalación automática
  - `.dockerignore` para optimizar builds
  
- **Documentación Docker**
  - `docs/quickstart/DOCKER_QUICK_START.md` - Inicio rápido (5 min)
  - `docs/technical/DOCKER_GUIDE.md` - Guía completa
  - `docs/changelog/DOCKER_COMPLETE.md` - Resumen de implementación
  - `docs/changelog/DOCKER_README.md` - Referencia de archivos
  - `docs/changelog/DOCKER_UPDATE.md` - Actualización Docker
  - `docs/changelog/DOCKER_WELCOME.md` - Bienvenida Docker

- **Frontend mejorado**
  - `frontend/index.html` - Portal HTML con formulario de pago
  - `frontend/index.js` - Lógica para cargar planes y procesar pagos
  - `frontend/styles.css` - Estilos responsive y modernos
  - Servidor sirve archivos estáticos automáticamente

- **Reorganización de documentación**
  - Estructura `docs/` con 5 subcarpetas
  - `docs/business/` - Base teórica (3 docs)
  - `docs/technical/` - Guías técnicas (3 docs)
  - `docs/quickstart/` - Inicio rápido (4 docs)
  - `docs/changelog/` - Historial de fixes (12 docs)
  - `docs/external/` - Referencias externas (1 doc)

- **Análisis del proyecto**
  - `ANALISIS_PROYECTO.md` - Evaluación completa del estado
  - `ESTADO_ACTUAL.md` - Resumen ejecutivo para contextualización rápida
  - `CHANGELOG.md` - Este archivo

### Corregido
- **Rutas no cargaban** (`docs/changelog/FIX_ROOT_CAUSE.md`)
  - Problema: Un try/catch agrupaba 4 rutas, si una fallaba todas caían
  - Solución: Cada ruta en su propio try/catch independiente
  - Archivo: `backend/server.js`

- **Frontend no encontrado** (`docs/changelog/FRONTEND_FIXED.md`)
  - Problema: ENOENT al buscar frontend en Docker
  - Solución: Búsqueda en múltiples rutas (5 ubicaciones)
  - Archivos: `backend/server.js`, `Dockerfile`

- **Imagen MariaDB incorrecta** (`docs/changelog/DOCKER_FIXED.md`)
  - Problema: `mariadb:10.6-alpine` no existe en Docker Hub
  - Solución: Cambiado a `mariadb:latest`
  - Archivo: `docker-compose.yml`

- **Error npm ci sin package-lock.json** (`docs/changelog/DOCKERFILE_FIXED.md`)
  - Problema: `npm ci` requiere package-lock.json
  - Solución: Cambiado a `npm install --production`
  - Archivo: `Dockerfile`

- **Build lento por timeouts** (`docs/changelog/BUILD_SLOW_FIXED.md`)
  - Problema: npm se colgaba esperando red
  - Solución: Configuración de fetch-retries y timeouts
  - Archivo: `Dockerfile`

### Cambiado
- **Estructura de documentación**
  - Antes: 23 archivos *.md en raíz
  - Ahora: Documentos organizados en `docs/` por categoría
  
- **Frontend**
  - Antes: Solo `resources/` (portal KLCiS original)
  - Ahora: `frontend/` (nuevo) + `resources/` (original)

### Técnico
- **Backend**: 12 archivos JS (config, controllers, middleware, routes, server)
- **Base de Datos**: 6 tablas normalizadas + índices optimizados
- **Frontend**: 3 archivos (HTML, JS, CSS)
- **Docker**: 5 archivos (Dockerfile, compose, nginx, dockerignore, script)
- **Líneas de código**: ~3,500
- **Documentación**: ~80 páginas en 23 documentos

---

## [2.0.0] - 2024 (Versión Anterior)

### Añadido
- **Backend Node.js completo**
  - Express server con middlewares (helmet, cors, morgan)
  - Pool MariaDB con transacciones
  - Configuración Bancomercantil (sandbox + producción)
  - Configuración Omada (Cloud + OC200)
  - Encriptación AES256 ECB
  - Validación de inputs (teléfono, MAC, montos)

- **Controladores**
  - `planController.js` - CRUD completo de planes
  - `paymentController.js` - Pagos C2P con Bancomercantil

- **Rutas API**
  - `/api/v1/plans` - Gestión de planes
  - `/api/v1/payments` - Procesamiento de pagos
  - `/api/v1/sessions` - Sesiones WiFi
  - `/api/v1/omada` - Integración Omada

- **Base de Datos MariaDB**
  - `schema.sql` - 6 tablas (plans, transactions, wifi_sessions, users, payment_errors, audit_logs)
  - `seed.sql` - 8 planes precargados + 20 códigos de error

- **Documentación inicial**
  - `PROPUESTA_FINAL.md` - Resumen ejecutivo
  - `README_FINAL.md` - Propuesta completa
  - `IMPLEMENTATION_GUIDE.md` - Guía técnica
  - `IMPLEMENTATION_PLAN.md` - Plan 8 fases
  - `QUICK_START.md` - Inicio rápido
  - `VISUAL_SUMMARY.md` - Diagramas
  - `INDEX.md` - Mapa de documentación

- **Ejemplos**
  - `examples/api-mercantil.json` - Postman collection
  - `examples/example-encript.js` - Ejemplo AES256
  - `examples/frontend-integration.js` - Código frontend

### Características
- Integración Pago Móvil C2P Bancomercantil
- Soporte Omada Cloud y OC200
- Encriptación AES256 compatible con Bancomercantil
- Webhooks para confirmación de pagos
- API REST con 12+ endpoints
- 8 planes horarios precargados
- Auditoría completa de transacciones

---

## [1.0.0] - 2023 (Versión Original)

### Añadido
- Portal cautivo básico para Omada
- Integración con KLCiS (sistema de vouchers)
- Soporte para Gcash, Maya, ShopeePay (Philippines)
- Frontend HTML con AdminLTE
- Recursos estáticos (CSS, JS, imágenes)

### Notas
- Versión original del portal cautivo
- Sin integración de pago móvil Bancomercantil
- Sin base de datos persistente
- Solo autenticación por vouchers

---

## [No Lanzado] - Próximas Funcionalidades

### Por Implementar
- [ ] Webhook Bancomercantil completo con validación de firma
- [ ] Integración real con Omada API (autenticación de clientes)
- [ ] Autenticación JWT para rutas admin
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (Supertest)
- [ ] Documentación API con Swagger/OpenAPI
- [ ] Dashboard administrativo
- [ ] Sistema de logs estructurado (Winston/Pino)
- [ ] Rate limiting implementado
- [ ] Manejo de errores global mejorado

### En Progreso
- [ ] Reorganización de documentación (75% completado)
- [ ] Limpieza de archivos duplicados

### Planificado
- [ ] Deployment en producción
- [ ] Configuración de monitoreo
- [ ] Backups automáticos
- [ ] CI/CD con GitHub Actions
- [ ] Multi-idioma soporte
- [ ] App móvil complementaria

---

## Migración de Versiones

### De 1.x a 2.x
- **Breaking Changes**:
  - Nueva estructura de backend (Node.js + Express)
  - Base de datos MariaDB requerida
  - Variables de entorno actualizadas
  - Nuevos endpoints API
  
- **Pasos de migración**:
  1. Instalar Node.js 14+ y MariaDB 10.5+
  2. Ejecutar `npm install`
  3. Crear base de datos: `mysql < database/schema.sql`
  4. Cargar datos iniciales: `mysql omada_payment < database/seed.sql`
  5. Configurar `.env` con credenciales
  6. Iniciar servidor: `npm run dev`

### De 2.0 a 2.1
- **Cambios**:
  - Docker soporte agregado (opcional)
  - Documentación reorganizada
  - Frontend mejorado
  
- **Pasos de migración**:
  1. Opcional: Instalar Docker
  2. Actualizar referencias a documentación (ahora en `docs/`)
  3. Reconstruir Docker si aplica: `docker-compose build`

---

## Convenciones

### Formato de Versiones
- **Major** (X.0.0): Cambios incompatibles
- **Minor** (0.X.0): Nuevas funcionalidades compatibles
- **Patch** (0.0.X): Corrección de errores

### Tipo de Cambios
- **Añadido**: Nuevas funcionalidades
- **Cambiado**: Modificaciones a funcionalidades existentes
- **Deprecado**: Funcionalidades que serán eliminadas
- **Eliminado**: Funcionalidades removidas
- **Corregido**: Arreglos de bugs
- **Seguridad**: Vulnerabilidades solucionadas
- **Técnico**: Cambios internos sin impacto en funcionalidad

---

## Contacto

Para preguntas o soporte:
- Documentación: Ver `docs/`
- Issues: GitHub Issues
- Email: [Configurar email de contacto]

---

**Última actualización**: 2026-09-14  
**Versión actual**: 2.1.0  
**Próxima versión planificada**: 2.2.0 (Tests + API Docs)
