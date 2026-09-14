# 🌐 Portal Cautivo Omada - Pago Móvil Bancomercantil V2

Portal cautivo inteligente para WiFi con autenticación por planes horarios usando Pago Móvil (C2P) de Bancomercantil. Compatible con **Omada Cloud** y **OC200** (controlador hardware).

## 📋 Características

✅ **Planes por Hora** - 1h, 2h, 4h, 8h, 24h configurables  
✅ **Pago Móvil C2P** - Integración Bancomercantil con encriptación AES256  
✅ **Base de Datos MariaDB** - Persistencia de transacciones y sesiones  
✅ **Omada Cloud + OC200** - Soporta ambos controladores  
✅ **Seguridad** - HTTPS, validaciones, logs de auditoría  
✅ **Webhooks** - Confirmación automática de pagos  
✅ **API REST** - Endpoints documentados  

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│   Frontend Portal (index.html)           │
│   - Selector de Planes                   │
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

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 14+
- MariaDB 10.5+
- Omada Cloud o OC200
- Credenciales Bancomercantil

### 1. Clonar y Configurar

```bash
cd /home/pescador/Documents/programacion/portalc4/cpomada-v2
npm install
```

### 2. Base de Datos

```bash
# Crear BD
mysql -u root -p < database/schema.sql

# Insertar datos iniciales
mysql -u root -p omada_payment < database/seed.sql
```

### 3. Variables de Entorno

```bash
cp .env.example .env
nano .env
```

Completar con tus credenciales:
- `MERCANTIL_MERCHANT_ID` - ID de comerciante
- `MERCANTIL_ENCRYPTION_KEY` - Clave para encriptación
- `OMADA_SITE_ID` - ID del sitio Omada
- `OMADA_USERNAME` / `OMADA_PASSWORD` - Credenciales

### 4. Crear Planes

```bash
# Iniciar servidor primero
npm run dev

# En otra terminal, crear planes
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plan 1 Hora",
    "hours": 1,
    "price": 1.50,
    "description": "Acceso 1 hora"
  }'
```

### 5. Desplegar en Omada

1. Ir a Omada Controller → Portal Settings
2. Subir archivo ZIP con `index.html` + `resources/`
3. Configurar Pre-Authentication
4. Habilitar HTTPS Redirection

---

## 📱 Flujo de Pago

```
1. Usuario conecta a WiFi
   ↓
2. Portal Cautivo carga
   ↓
3. Selecciona Plan (1h, 2h, etc.)
   ↓
4. Ingresa número móvil (+584XX-XXXXXXX)
   ↓
5. Sistema encripta datos y envía a Bancomercantil
   ↓
6. Bancomercantil procesa C2P
   ↓
7. Webhook confirma pago exitoso
   ↓
8. BD crea sesión WiFi con duración
   ↓
9. Omada autentica dispositivo
   ↓
10. Usuario tiene acceso WiFi por X horas
```

---

## 🔌 Endpoints API

### Planes
```
GET  /api/v1/plans           - Listar todos los planes
GET  /api/v1/plans/:id       - Obtener plan específico
POST /api/v1/plans           - Crear plan (admin)
PUT  /api/v1/plans/:id       - Actualizar plan (admin)
DEL  /api/v1/plans/:id       - Eliminar plan (admin)
```

### Pagos
```
POST /api/v1/payments/initiate              - Iniciar pago
GET  /api/v1/payments/status/:transactionId - Verificar estado
POST /api/v1/payments/webhook/mercantil     - Callback Bancomercantil
```

### Sesiones WiFi
```
GET  /api/v1/sessions/check/:clientMac     - Verificar sesión activa
GET  /api/v1/sessions/history/:clientMac   - Historial de sesiones
POST /api/v1/sessions/extend                - Extender sesión
```

### Omada
```
GET  /api/v1/omada/portal-settings          - Config portal
POST /api/v1/omada/auth                     - Autenticar cliente
GET  /api/v1/omada/client/:clientMac        - Info cliente
POST /api/v1/omada/logout/:clientMac        - Desautenticar
```

---

## 📊 Estructura Base de Datos

### plans
```sql
id, name, hours, price, currency, description, is_active, created_at
```

### transactions
```sql
id, transaction_id, client_mac, phone_number, plan_id, amount, status,
payment_reference, invoice_number, mercantil_response, error_code, error_message
```

### wifi_sessions
```sql
id, session_id, client_mac, transaction_id, plan_id, start_time, end_time,
duration_hours, status, data_used_mb
```

### users
```sql
id, phone_number, client_mac, first_name, last_name, email,
total_spent, last_purchase_at, is_active
```

---

## 🔐 Seguridad

### Encriptación
- **Algoritmo**: AES256 ECB (compatible Bancomercantil)
- **Campos encriptados**: CVV, contraseñas, 2FA, números móviles
- **Clave**: Hash SHA256 de `MERCANTIL_ENCRYPTION_KEY`

### Validaciones
- Validación de formato de teléfono
- Validación de dirección MAC
- Validación de montos
- HTTPS obligatorio en producción
- CORS configurado

### Auditoría
- Log de todas las transacciones
- Log de autenticaciones
- Log de errores
- Tabla `audit_logs` en BD

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED - BD"
```bash
# Verificar MariaDB
sudo systemctl status mariadb
sudo systemctl start mariadb
```

### Error: "Bancomercantil Auth Failed"
```
- Verificar X-IBM-Client-ID
- Verificar encriptación MERCANTIL_ENCRYPTION_KEY
- Verificar merchantId y terminalId
```

### Error: "Omada Authentication Failed"
```
- Verificar credenciales Omada
- Verificar SITE_ID
- Verificar conectividad a Omada Cloud/OC200
```

---

## 📈 Monitoreo

### Logs
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver errores
tail -f logs/error.log
```

### Dashboard de Transacciones
```sql
-- Transacciones hoy
SELECT COUNT(*), SUM(amount) FROM transactions WHERE DATE(created_at) = TODAY();

-- Sesiones activas
SELECT COUNT(*) FROM wifi_sessions WHERE status = 'active';

-- Usuarios frecuentes
SELECT phone_number, COUNT(*) FROM transactions 
GROUP BY phone_number ORDER BY COUNT(*) DESC LIMIT 10;
```

---

## 🔄 Actualización de Planes

```bash
# Agregar plan
INSERT INTO plans (name, hours, price, currency, description)
VALUES ('Plan 12 Horas', 12, 4.50, 'VES', 'Acceso 12 horas');

# Cambiar precio
UPDATE plans SET price = 2.00 WHERE name = 'Plan 1 Hora';

# Desactivar plan
UPDATE plans SET is_active = FALSE WHERE id = 1;
```

---

## 📞 Soporte

- Banco: Bancomercantil (Developer Portal)
- Omada: https://omada.tplinkcloud.com
- Documentación API: `/api-docs`

---

## ⚖️ Licencia

MIT

---

**Versión**: 2.0.0  
**Última actualización**: 2024  
**Estado**: 🟢 Producción