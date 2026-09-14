# ⚡ INICIO RÁPIDO - 10 MINUTOS

## Requisitos Previos
- Node.js 14+ instalado
- MariaDB/MySQL corriendo
- Credenciales Bancomercantil (opcional para pruebas iniciales)

---

## Paso 1: Clonar el Proyecto
```bash
cd /home/pescador/Documents/programacion/portalc4/cpomada-v2
```

---

## Paso 2: Instalar Dependencias
```bash
npm install
```
*Esto descargará ~200MB de paquetes. Espere 2-3 minutos.*

---

## Paso 3: Crear Base de Datos
```bash
# Opción A: Usando root (sin contraseña)
mysql < database/schema.sql
mysql omada_payment < database/seed.sql

# Opción B: Con contraseña
mysql -u root -p < database/schema.sql
mysql -u root -p omada_payment < database/seed.sql
```

**Verificar que funcionó:**
```bash
mysql
> USE omada_payment;
> SHOW TABLES;
# Deberías ver: plans, transactions, wifi_sessions, users, audit_logs, payment_errors
> SELECT * FROM plans;
# Deberías ver 8 planes precargados
> EXIT;
```

---

## Paso 4: Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

**Valores mínimos para pruebas locales:**
```env
NODE_ENV=development
PORT=3000

# Base de Datos (valores por defecto)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=omada_payment

# Bancomercantil (pruebas - valores dummy)
MERCANTIL_CONTROLLER_TYPE=sandbox
MERCANTIL_CLIENT_ID_SANDBOX=test_client_id
MERCANTIL_INTEGRATOR_ID=31
MERCANTIL_MERCHANT_ID=123456
MERCANTIL_TERMINAL_ID=terminal01
MERCANTIL_ENCRYPTION_KEY=mi_clave_secreta_prueba

# Omada (pruebas)
OMADA_CONTROLLER_TYPE=cloud
OMADA_SITE_ID=test_site
OMADA_USERNAME=admin@test.com
OMADA_PASSWORD=admin123

# URLs
LANDING_URL=http://localhost:3000
CORS_ORIGIN=*
```

---

## Paso 5: Iniciar Servidor
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# O modo producción
npm start
```

**Deberías ver:**
```
✅ Servidor corriendo en puerto 3000
📡 Ambiente: development
🏦 Banco: Bancomercantil
☁️  Omada: Cloud
```

---

## Paso 6: Probar APIs (en otra terminal)

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development"
}
```

### Test 2: Obtener Planes
```bash
curl http://localhost:3000/api/v1/plans
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "1 Hora",
      "hours": 1,
      "price": "1.50",
      "currency": "VES",
      "description": "Acceso WiFi por 1 hora..."
    },
    ...
  ]
}
```

### Test 3: Crear Plan Personalizado
```bash
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plan Test",
    "hours": 2,
    "price": 3.50,
    "currency": "VES",
    "description": "Plan de prueba"
  }'
```

### Test 4: Obtener Plan Específico
```bash
curl http://localhost:3000/api/v1/plans/1
```

---

## Paso 7: Probar Pago (Simulado)

**Crear una transacción de prueba:**
```bash
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+584120000000",
    "plan_id": 1,
    "client_mac": "AA:BB:CC:DD:EE:FF",
    "ap_mac": "11:22:33:44:55:66"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "transactionId": "TRX-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "paymentReference": "WIFI-DDEEFF-1",
  "amount": "1.50",
  "currency": "VES",
  "plan": {
    "id": 1,
    "hours": 1
  },
  "message": "Pago iniciado, por favor complete la transacción en su banco"
}
```

**Verificar transacción en BD:**
```bash
mysql
> USE omada_payment;
> SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1;
> EXIT;
```

---

## Paso 8: Ver Datos en la Base de Datos

```bash
# Conectar a MySQL
mysql omada_payment

# Comandos útiles
SHOW TABLES;                          # Ver todas las tablas
SELECT * FROM plans;                  # Ver planes
SELECT * FROM transactions;           # Ver transacciones
SELECT * FROM wifi_sessions;          # Ver sesiones WiFi
SELECT * FROM users;                  # Ver usuarios
SELECT * FROM audit_logs;             # Ver auditoría

# Contar transacciones hoy
SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURDATE();

# Ver transacciones recientes
SELECT transaction_id, phone_number, amount, status, created_at 
FROM transactions 
ORDER BY created_at DESC LIMIT 5;

# Salir
EXIT;
```

---

## 🐛 Solucionar Problemas Comunes

### Error: "ECONNREFUSED" en BD
```bash
# Verificar que MariaDB está corriendo
sudo systemctl status mariadb

# O iniciar si está parada
sudo systemctl start mariadb
```

### Error: "Access Denied for user 'root'"
```bash
# Editar .env con contraseña correcta
nano .env
# Actualizar DB_PASSWORD

# O resetear contraseña MySQL
sudo mysql
> ALTER USER 'root'@'localhost' IDENTIFIED BY '';
> FLUSH PRIVILEGES;
> EXIT;
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ya está en uso
```bash
# Cambiar puerto en .env
nano .env
PORT=3001

# O matar proceso existente
sudo lsof -ti:3000 | xargs kill -9
```

---

## 📊 Dashboard Rápido (SQL)

```bash
# Todas las transacciones del día
mysql omada_payment -e "
SELECT 
  transaction_id, 
  phone_number, 
  amount, 
  status, 
  created_at 
FROM transactions 
WHERE DATE(created_at) = CURDATE() 
ORDER BY created_at DESC;
"

# Estadísticas
mysql omada_payment -e "
SELECT 
  COUNT(*) as total,
  SUM(amount) as monto_total,
  AVG(amount) as promedio
FROM transactions 
WHERE DATE(created_at) = CURDATE();
"

# Planes más vendidos
mysql omada_payment -e "
SELECT 
  p.name,
  COUNT(*) as veces,
  SUM(t.amount) as total
FROM transactions t
JOIN plans p ON t.plan_id = p.id
WHERE DATE(t.created_at) = CURDATE()
GROUP BY p.id
ORDER BY COUNT(*) DESC;
"
```

---

## 🚀 Siguientes Pasos

### Corto Plazo
1. ✅ Leer `IMPLEMENTATION_GUIDE.md`
2. ✅ Leer `IMPLEMENTATION_PLAN.md`
3. ✅ Obtener credenciales reales de Bancomercantil
4. ✅ Configurar Omada (Cloud o OC200)

### Mediano Plazo
1. ✅ Integrar credenciales Bancomercantil en .env
2. ✅ Subir portal a Omada
3. ✅ Probar flujo completo de pago
4. ✅ Configurar webhooks

### Largo Plazo
1. ✅ Configurar HTTPS
2. ✅ Desplegar en producción
3. ✅ Configurar backups automáticos
4. ✅ Implementar monitoreo 24/7

---

## 📚 Recursos

### Documentación Incluida
- `PROPUESTA_FINAL.md` - Resumen ejecutivo
- `IMPLEMENTATION_GUIDE.md` - Guía detallada
- `IMPLEMENTATION_PLAN.md` - Plan 8 fases
- `examples/` - Código de ejemplo

### Archivos Importantes
- `package.json` - Dependencias
- `.env.example` - Plantilla de variables
- `database/schema.sql` - Estructura BD
- `database/seed.sql` - Datos iniciales

### APIs Documentadas
- `backend/routes/plans.js` - Rutas de planes
- `backend/routes/payment.js` - Rutas de pagos
- `backend/routes/sessions.js` - Rutas de sesiones
- `backend/routes/omada.js` - Rutas Omada

---

## 💡 Tips Útiles

1. **Desarrollo**: Usa `npm run dev` para reinicio automático
2. **Logs**: Revisa la consola para errores detallados
3. **Testing**: Usa Postman con `examples/api-mercantil.json`
4. **BD**: Haz backups antes de cambios importantes
5. **Seguridad**: Nunca commitees `.env` a Git

---

## ✅ Checklist de Validación

- [ ] Servidor Node.js iniciado correctamente
- [ ] BD MariaDB conectada
- [ ] Endpoint `/health` responde
- [ ] Endpoint `/api/v1/plans` devuelve datos
- [ ] Transacciones se guardan en BD
- [ ] Logs aparecen en consola sin errores
- [ ] Variables `.env` configuradas

Si todos pasan ✅, ¡estás listo para continuar! 🎉

---

## 📞 Ayuda

Si algo no funciona:
1. Revisa los logs en la consola
2. Consulta la sección de troubleshooting en `IMPLEMENTATION_GUIDE.md`
3. Verifica que MariaDB está corriendo
4. Asegúrate de que el puerto 3000 está disponible
5. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

---

**¡Bienvenido a tu nuevo Portal Cautivo Omada!** 🌐