# 📋 PLAN DE IMPLEMENTACIÓN COMPLETO
## Portal Cautivo Omada + Pago Móvil Bancomercantil

---

## FASE 1: PREPARACIÓN (Semana 1)

### 1.1 Obtener Credenciales Bancomercantil
- [ ] Registrarse en Developer Portal: https://developer.mercantilbanco.com
- [ ] Crear aplicación de prueba
- [ ] Obtener:
  - `X-IBM-Client-ID` (SANDBOX)
  - `Merchant ID`
  - `Terminal ID`
  - `Encryption Key`
- [ ] Documentar credenciales en `.env`

### 1.2 Configurar Omada
- **Para Omada Cloud:**
  - [ ] Crear cuenta en https://omada.tplinkcloud.com
  - [ ] Agregar sitio WiFi
  - [ ] Obtener `Site ID`, `Client ID`, `Client Secret`
  - [ ] Crear usuario API

- **Para OC200:**
  - [ ] Acceder a OC200 en https://192.168.1.1:8043
  - [ ] Crear usuario administrador API
  - [ ] Habilitar API REST
  - [ ] Obtener URL base del controlador

### 1.3 Infraestructura
- [ ] Servidor Linux con Node.js 14+
- [ ] MariaDB 10.5+ instalado
- [ ] Puertos abiertos: 3000 (API), 443 (HTTPS)
- [ ] Certificado SSL válido

---

## FASE 2: DESARROLLO BACKEND (Semana 2-3)

### 2.1 Base de Datos
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE omada_payment CHARACTER SET utf8mb4;
USE omada_payment;

# Cargar schema
SOURCE database/schema.sql;
SOURCE database/seed.sql;

# Verificar tablas
SHOW TABLES;
```

### 2.2 Instalación Dependencias
```bash
npm install

# Verificar que se instalaron:
# - express, cors, helmet, morgan
# - mysql2 (para MariaDB)
# - axios (llamadas HTTP)
# - crypto-js (AES256)
# - uuid (IDs únicos)
# - dotenv (variables de entorno)
```

### 2.3 Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env

# Completar TODOS los valores:
# DATABASE
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mipassword
DB_NAME=omada_payment

# BANCOMERCANTIL
MERCANTIL_CLIENT_ID_SANDBOX=xxx
MERCANTIL_MERCHANT_ID=123456
MERCANTIL_TERMINAL_ID=abcde
MERCANTIL_ENCRYPTION_KEY=mi_clave_secreta

# OMADA (elegir uno)
OMADA_CONTROLLER_TYPE=cloud
OMADA_CLOUD_URL=https://cloud.omadanetwork.com
OMADA_SITE_ID=xxxxx
OMADA_USERNAME=admin@omada.com
OMADA_PASSWORD=password
```

### 2.4 Pruebas Locales Backend
```bash
# Iniciar servidor desarrollo
npm run dev

# En otra terminal, probar endpoints:

# 1. Obtener planes
curl http://localhost:3000/api/v1/plans

# 2. Crear plan (TEST)
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Plan Test","hours":1,"price":1.50}'

# 3. Iniciar pago (TEST)
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number":"+584120000000",
    "plan_id":1,
    "client_mac":"AA:BB:CC:DD:EE:FF",
    "ap_mac":"00:11:22:33:44:55"
  }'
```

---

## FASE 3: DESARROLLO FRONTEND (Semana 2-3)

### 3.1 Modificar index.html
```html
<!-- Agregar seccion de planes -->
<div id="plans-container">
  <h2>Planes Disponibles</h2>
  <select id="plan-select">
    <!-- Se llena con AJAX -->
  </select>
</div>

<!-- Formulario pago móvil -->
<div id="payment-form">
  <input type="tel" id="phone-number" placeholder="+584XX-XXXXXXX">
  <input type="text" id="plan-amount" readonly>
  <button id="pay-button">Pagar con Pago Móvil</button>
</div>
```

### 3.2 Modificar index.js (resources/index.js)
```javascript
// Cargar planes al iniciar
function loadPlans() {
  fetch('/api/v1/plans')
    .then(r => r.json())
    .then(data => {
      const select = document.getElementById('plan-select');
      data.data.forEach(plan => {
        const opt = document.createElement('option');
        opt.value = plan.id;
        opt.text = `${plan.name} - Bs ${plan.price}`;
        opt.dataset.hours = plan.hours;
        select.appendChild(opt);
      });
    });
}

// Iniciar pago
async function initiatePayment() {
  const planId = document.getElementById('plan-select').value;
  const phone = document.getElementById('phone-number').value;
  const clientMac = getQueryStringKey('clientMac');

  const response = await fetch('/api/v1/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone_number: phone,
      plan_id: parseInt(planId),
      client_mac: clientMac
    })
  });

  const result = await response.json();
  if (result.success) {
    // Redirigir a Bancomercantil o mostrar QR
    alert('Transacción iniciada: ' + result.transactionId);
  }
}
```

---

## FASE 4: INTEGRACIÓN OMADA (Semana 3-4)

### 4.1 Configurar Portal en Omada Cloud

1. **Subir Portal Personalizado:**
   - Crear ZIP: `index.html` + `resources/`
   - Omada → Portal → Manage Portal → Upload Custom Portal
   - Seleccionar ZIP cargado

2. **Configurar Flujo:**
   - Settings → Portal → Edit
   - ☑️ Enable HTTPS Redirection
   - Auth Type → Hotspot (Multiple)
   - Planes como tipos de hotspot

3. **Pre-Autenticación:**
   - Settings → Portal → Access Control
   - ☑️ Enable Pre-Authentication
   - Agregar IP/URLs en PRE-AUTHENTICATION.txt:
     ```
     http://portal.example.com
     192.168.1.100
     ```

### 4.2 Configurar Portal en OC200

1. **Acceder a OC200:**
   ```bash
   https://[IP-OC200]:8043
   Login como admin
   ```

2. **Subir Portal:**
   - Omada → Portal Management → Upload Portal
   - Seleccionar ZIP personalizado

3. **Configurar Pre-Auth:**
   - Settings → Portal Settings
   - ☑️ Enable Custom Portal
   - ☑️ Pre-Authentication Enabled

### 4.3 Pruebas de Integración

```bash
# Verificar conectividad Omada
curl -X POST https://cloud.omadanetwork.com/v2/api/authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin@omada.com",
    "password":"password"
  }'

# Verificar que portal carga
curl http://192.168.1.1/portal/index.html
```

---

## FASE 5: PRUEBAS (Semana 4)

### 5.1 Pruebas Unitarias - Backend
```bash
# Crear test/paymentController.test.js
npm test
```

### 5.2 Pruebas de Integración

```bash
# 1. Conectar a WiFi (cliente real)
# 2. Abrir navegador → Portal cautivo
# 3. Seleccionar plan
# 4. Ingresar teléfono
# 5. Hacer pago en Bancomercantil
# 6. Verificar sesión WiFi creada
# 7. Desconectar después de X horas
```

### 5.3 Verificar BD
```sql
-- Verificar transacciones
SELECT * FROM transactions ORDER BY created_at DESC;

-- Verificar sesiones activas
SELECT * FROM wifi_sessions WHERE status = 'active';

-- Verificar usuarios
SELECT * FROM users;
```

### 5.4 Carga y Stress
```bash
# Simular 100 transacciones simultáneas
ab -n 100 -c 10 http://localhost:3000/api/v1/plans
```

---

## FASE 6: SEGURIDAD (Semana 4)

### 6.1 HTTPS
```bash
# Generar certificado auto-firmado
openssl req -x509 -newkey rsa:4096 -nodes -days 365 \
  -keyout key.pem -out cert.pem

# En producción, usar Let's Encrypt
certbot certonly --standalone -d tu-dominio.com
```

### 6.2 Variables Sensibles
- [ ] No commitar `.env` a Git
- [ ] Usar `.env.example` como template
- [ ] Usar gestor de secretos (AWS Secrets, Vault)

### 6.3 Validaciones
- [ ] Validar todos los inputs
- [ ] Sanitizar datos para SQL injection
- [ ] Rate limiting en endpoints
- [ ] CORS restrictivo

### 6.4 Auditoría
- [ ] Revisar logs de transacciones fallidas
- [ ] Monitorear intentos de fraud
- [ ] Registrar todas las autenticaciones Omada

---

## FASE 7: DEPLOYMENT (Semana 5)

### 7.1 Servidor Producción

```bash
# Compilar como servicio (systemd)
sudo nano /etc/systemd/system/omada-portal.service

[Unit]
Description=Omada Portal Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/omada-portal
ExecStart=/usr/bin/node backend/server.js
Restart=always
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target

# Activar servicio
sudo systemctl enable omada-portal
sudo systemctl start omada-portal
```

### 7.2 Nginx Reverse Proxy

```nginx
server {
  listen 443 ssl http2;
  server_name portal.example.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }

  location /portal {
    root /opt/omada-portal/resources;
  }
}
```

### 7.3 Backups BD
```bash
# Backup diario
sudo mysqldump omada_payment > backup_$(date +%Y%m%d).sql

# Script cron
0 2 * * * mysqldump omada_payment > /backups/omada_$(date +\%Y\%m\%d).sql
```

### 7.4 Monitoring
```bash
# Instalar PM2 para monitoreo
npm install -g pm2
pm2 start backend/server.js --name "omada-portal"
pm2 save
```

---

## FASE 8: CAPACITACIÓN Y DOCUMENTACIÓN (Semana 5)

### 8.1 Manual del Administrador
- [ ] Cómo agregar/editar planes
- [ ] Cómo ver transacciones
- [ ] Cómo manejar problemas
- [ ] Contactos de soporte

### 8.2 Manual del Usuario
- [ ] Cómo conectar a WiFi
- [ ] Cómo pagar
- [ ] Qué hacer si falló el pago
- [ ] FAQ

### 8.3 Documentación Técnica
- [ ] API docs (Swagger/OpenAPI)
- [ ] Diagrama de arquitectura
- [ ] Procedimientos de backup
- [ ] Plan de recuperación de desastres

---

## CHECKLIST FINAL ANTES DE PRODUCCIÓN

- [ ] Base de datos con todos los datos
- [ ] Certificado SSL válido
- [ ] Variables de entorno configuradas
- [ ] Backups automatizados funcionando
- [ ] Logs rotando correctamente
- [ ] Monitoreo activo (PM2/monitoring)
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Validaciones de input activas
- [ ] Transacciones siendo registradas
- [ ] Webhooks Bancomercantil recibiendo
- [ ] Sesiones WiFi siendo creadas en Omada
- [ ] Tests pasando 100%
- [ ] Performance aceptable (<200ms)
- [ ] Disponibilidad >99.5%

---

## SOPORTE Y MANTENIMIENTO

### Monitoreo Diario
```bash
# Ver logs
tail -f /var/log/omada-portal.log

# Ver sesiones activas
mysql -e "SELECT COUNT(*) FROM omada_payment.wifi_sessions WHERE status='active';"

# Ver transacciones del día
mysql -e "SELECT COUNT(*), SUM(amount) FROM omada_payment.transactions WHERE DATE(created_at)=CURDATE();"
```

### Escalabilidad Futura
- Agregar caching (Redis)
- Load balancing (HAProxy/Nginx)
- Replicación BD (Master-Slave)
- CDN para recursos estáticos

---

**Tiempo Total Estimado**: 5-6 semanas  
**Equipo Recomendado**: 2-3 desarrolladores  
**Presupuesto**: Infraestructura + Licencias  

¡Listo para implementar! 🚀