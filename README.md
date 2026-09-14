# Portal Cautivo Omada V2 - Pago Móvil Bancomercantil

> Sistema de monetización WiFi con autenticación por planes horarios y pago móvil C2P de Bancomercantil. Compatible con Omada Cloud y OC200.

**Versión**: 2.1.0 | **Estado**: 75% Completado | **Licencia**: MIT

---

## 🚀 Inicio Rápido

### Con Docker (Recomendado - 5 minutos)

```bash
# Clonar y ejecutar
cd cpomada-v2
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh

# Acceder
open http://localhost:3000
```

### Sin Docker (10 minutos)

```bash
# Instalar dependencias
npm install

# Configurar base de datos
mysql < database/schema.sql
mysql omada_payment < database/seed.sql

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus credenciales

# Iniciar servidor
npm run dev

# Acceder
open http://localhost:3000
```

---

## 📖 Documentación

### 🎯 Empezar Aquí

| Documento | Tiempo | Descripción |
|-----------|--------|-------------|
| [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md) | 5 min | **Resumen ejecutivo del proyecto** |
| [ANALISIS_PROYECTO.md](ANALISIS_PROYECTO.md) | 15 min | Análisis completo y plan de acción |
| [CHANGELOG.md](CHANGELOG.md) | 5 min | Historial de cambios |

### 📘 Por Categoría

#### Base Teórica (Negocio)
- [Propuesta Final](docs/business/PROPUESTA_FINAL.md) - Resumen ejecutivo, ROI
- [README Final](docs/business/README_FINAL.md) - Propuesta completa
- [Visual Summary](docs/business/VISUAL_SUMMARY.md) - Diagramas y estadísticas

#### Guías Técnicas
- [Implementation Plan](docs/technical/IMPLEMENTATION_PLAN.md) - Plan 8 fases
- [Implementation Guide](docs/technical/IMPLEMENTATION_GUIDE.md) - Guía técnica detallada
- [Docker Guide](docs/technical/DOCKER_GUIDE.md) - Docker completo

#### Inicio Rápido
- [Start Here](docs/quickstart/START_HERE.md) - Punto de entrada
- [Docker Quick Start](docs/quickstart/DOCKER_QUICK_START.md) - Docker en 5 min
- [Quick Start](docs/quickstart/QUICK_START.md) - Local en 10 min
- [Index](docs/quickstart/INDEX.md) - Mapa de documentación

#### Historial de Cambios
- Ver [docs/changelog/](docs/changelog/) para fixes y mejoras aplicadas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│   Frontend Portal (HTML/CSS/JS)         │
│   - Selector de Planes                  │
│   - Formulario Pago Móvil               │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
Backend Node.js    Omada API
├─ DB MariaDB      ├─ Cloud
├─ Encriptación    └─ OC200
└─ Validaciones
     │
     └─→ Bancomercantil API
         └─ C2P Payment
```

---

## 🔌 APIs Disponibles

### Planes
```
GET  /api/v1/plans           - Listar planes
GET  /api/v1/plans/:id       - Obtener plan
POST /api/v1/plans           - Crear plan (admin)
PUT  /api/v1/plans/:id       - Actualizar (admin)
DEL  /api/v1/plans/:id       - Eliminar (admin)
```

### Pagos
```
POST /api/v1/payments/initiate              - Iniciar pago
GET  /api/v1/payments/status/:transactionId - Ver estado
POST /api/v1/payments/webhook/mercantil     - Callback Banco
```

### Sesiones WiFi
```
GET  /api/v1/sessions/check/:clientMac      - Verificar sesión
GET  /api/v1/sessions/history/:clientMac    - Historial
POST /api/v1/sessions/extend                - Extender
```

### Omada
```
GET  /api/v1/omada/portal-settings          - Config portal
POST /api/v1/omada/auth                     - Autenticar
GET  /api/v1/omada/client/:clientMac        - Info cliente
POST /api/v1/omada/logout/:clientMac        - Desautenticar
```

---

## 💾 Base de Datos

### Tablas
- `plans` - Planes disponibles (8 precargados)
- `transactions` - Registro de pagos
- `wifi_sessions` - Sesiones activas
- `users` - Clientes
- `payment_errors` - Códigos de error (20 precargados)
- `audit_logs` - Auditoría

### Planes Precargados
```
1 Hora     → Bs 1.50
2 Horas    → Bs 2.50
4 Horas    → Bs 4.00
8 Horas    → Bs 7.00
24 Horas   → Bs 12.00
3 Días     → Bs 25.00
7 Días     → Bs 50.00
30 Días    → Bs 150.00
```

---

## 🐳 Docker

### Servicios
- **MariaDB** - Base de datos (puerto 3306)
- **Backend** - API Node.js (puerto 3000)
- **Nginx** - Reverse proxy + SSL (puertos 80/443, opcional)

### Comandos Útiles
```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose stop

# Eliminar todo
docker-compose down -v

# Acceder a BD
docker-compose exec mariadb mysql -u portal_user -p omada_payment
```

---

## 🔐 Seguridad

- ✅ Encriptación AES256 ECB (compatible Bancomercantil)
- ✅ HTTPS obligatorio en producción
- ✅ Validación de inputs (teléfono, MAC, montos)
- ✅ Pool de conexiones MariaDB
- ✅ Transacciones ACID
- ✅ Auditoría completa
- ⚠️ Rate limiting (pendiente)
- ⚠️ Autenticación JWT admin (pendiente)

---

## 📊 Estado del Proyecto

| Componente | Progreso | Estado |
|------------|----------|--------|
| Backend | 95% | ✅ Funcional |
| Base de Datos | 100% | ✅ Completo |
| Frontend | 95% | ✅ Funcional |
| Docker | 100% | ✅ Completo |
| Integración Bancomercantil | 70% | ⚠️ Parcial |
| Integración Omada | 60% | ⚠️ Parcial |
| Tests | 0% | ❌ Pendiente |

**Avance Total**: 75%  
**Tiempo a Producción**: 2-3 semanas

Ver [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md) para detalles.

---

## 🎯 Próximos Pasos

### Crítico (Esta Semana)
1. Completar webhook Bancomercantil
2. Implementar autenticación JWT
3. Completar integración Omada API

### Importante (Próxima Semana)
4. Escribir tests unitarios
5. Agregar rate limiting
6. Tests de integración

### Nice-to-have (2-3 semanas)
7. Documentación API (Swagger)
8. Dashboard administrativo
9. Logging estructurado

---

## 📁 Estructura del Proyecto

```
cpomada-v2/
├── 📖 docs/                          ← Documentación
│   ├── business/                     ← Base teórica
│   ├── technical/                    ← Guías técnicas
│   ├── quickstart/                   ← Inicio rápido
│   ├── changelog/                    ← Historial fixes
│   └── external/                     ← Referencias
│
├── 🔧 backend/                       ← Backend Node.js
│   ├── config/                       ← Configuraciones
│   ├── controllers/                  ← Lógica de negocio
│   ├── middleware/                   ← Middlewares
│   ├── routes/                       ← Endpoints API
│   └── server.js                     ← Entry point
│
├── 💾 database/                      ← SQL
│   ├── schema.sql                    ← 6 tablas
│   └── seed.sql                      ← Datos iniciales
│
├── 📱 frontend/                      ← Portal web
│   ├── index.html
│   ├── index.js
│   └── styles.css
│
├── 🐳 docker/                        ← Archivos Docker
├── 💡 examples/                      ← Ejemplos
├── 📋 package.json                   ← Dependencias
├── 📋 .env.example                   ← Variables entorno
├── 📄 README.md                      ← Este archivo
├── 📄 CHANGELOG.md                   ← Historial cambios
├── 📄 ESTADO_ACTUAL.md               ← Estado proyecto
└── 📄 ANALISIS_PROYECTO.md           ← Análisis completo
```

---

## 🔑 Credenciales Necesarias

### Bancomercantil
```env
MERCANTIL_CLIENT_ID_SANDBOX=xxx
MERCANTIL_MERCHANT_ID=123456
MERCANTIL_TERMINAL_ID=abcde
MERCANTIL_ENCRYPTION_KEY=mi_clave_secreta
```

### Omada
```env
OMADA_SITE_ID=xxxxx
OMADA_USERNAME=admin@omada.com
OMADA_PASSWORD=password
```

### Base de Datos
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=omada_payment
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Obtener planes
curl http://localhost:3000/api/v1/plans

# Iniciar pago (modo demo)
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"phone":"+584141234567","plan_id":1}'
```

---

## 📚 Recursos

### Documentación Oficial
- [Bancomercantil Developer](https://developer.mercantilbanco.com)
- [Omada Cloud](https://omada.tplinkcloud.com)
- [Node.js Docs](https://nodejs.org/en/docs)
- [Express Docs](https://expressjs.com)
- [MariaDB Docs](https://mariadb.com/docs)

### Documentación del Proyecto
- [Análisis Completo](ANALISIS_PROYECTO.md)
- [Estado Actual](ESTADO_ACTUAL.md)
- [Historial de Cambios](CHANGELOG.md)
- [Guía de Implementación](docs/technical/IMPLEMENTATION_GUIDE.md)

---

## 🐛 Troubleshooting

### Puerto 3000 ocupado
```bash
lsof -ti:3000 | xargs kill -9
```

### MariaDB no conecta
```bash
docker-compose logs mariadb
docker-compose restart mariadb
```

### Frontend no carga
```bash
docker-compose logs backend | grep "Frontend"
```

### Build lento
```bash
# Usar caché
docker-compose build backend
```

Ver [docs/changelog/](docs/changelog/) para más soluciones.

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo licencia MIT. Ver `LICENSE` para más información.

---

## 📞 Contacto

- **Documentación**: Ver `docs/`
- **Issues**: GitHub Issues
- **Email**: [Configurar]

---

## 🙏 Reconocimientos

- [Bancomercantil](https://www.mercantilbanco.com) - API Pago Móvil
- [TP-Link Omada](https://www.tp-link.com/omada-sdn/) - Controlador WiFi
- [Express.js](https://expressjs.com) - Framework web
- [MariaDB](https://mariadb.org) - Base de datos

---

**¿Listo para comenzar?** → Lee [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md)

**¿Necesitas ayuda?** → Consulta [docs/quickstart/START_HERE.md](docs/quickstart/START_HERE.md)

---

*Hecho con ❤️ para monetizar tu WiFi*
