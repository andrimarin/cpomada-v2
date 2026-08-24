/**
 * Servidor Express Principal
 * Portal Cautivo Omada con Pago Móvil Bancomercantil
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y logging
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Middleware de encriptación
const { encryptionMiddleware } = require('./middleware/encryption');
app.use(encryptionMiddleware);

// ============ SERVIR FRONTEND ============
// Buscar frontend en múltiples ubicaciones
const frontendPaths = [
  path.join(__dirname, '../frontend'),
  path.join(__dirname, '../../frontend'),
  path.join(__dirname, '../resources'),
  '/app/frontend',
  '/app/resources'
];

let frontendFound = false;
for (const frontendPath of frontendPaths) {
  try {
    if (fs.existsSync(frontendPath)) {
      console.log(`✅ Frontend encontrado en: ${frontendPath}`);
      app.use(express.static(frontendPath));
      frontendFound = true;
      break;
    }
  } catch (err) {
    console.log(`⚠️ Ruta no válida: ${frontendPath}`);
  }
}

if (!frontendFound) {
  console.warn('⚠️ Frontend no encontrado en ninguna ruta');
}

// ============ RUTAS API ============
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar rutas
try {
  const planRoutes = require('./routes/plans');
  const paymentRoutes = require('./routes/payments');
  const sessionRoutes = require('./routes/sessions');
  const omadaRoutes = require('./routes/omada');

  app.use('/api/v1/plans', planRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/sessions', sessionRoutes);
  app.use('/api/v1/omada', omadaRoutes);
  
  console.log('✅ Rutas API cargadas');
} catch (err) {
  console.warn('⚠️ Algunas rutas no están disponibles:', err.message);
}

// ============ RUTA RAÍZ ============
// Servir index.html para rutas no encontradas
app.get('/', (req, res) => {
  const indexPaths = [
    path.join(__dirname, '../frontend/index.html'),
    path.join(__dirname, '../../frontend/index.html'),
    path.join(__dirname, '../resources/index.html'),
    '/app/frontend/index.html',
    '/app/resources/index.html'
  ];
  
  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  res.status(404).send('Frontend no encontrado');
});

// ============ MANEJO DE ERRORES ============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    status: err.status || 500
  });
});

// ============ INICIAR SERVIDOR ============
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;