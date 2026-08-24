/**
 * Servidor Express Principal
 * Portal Cautivo Omada con Pago Móvil Bancomercantil
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

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
} catch (err) {
  console.warn('⚠️  Algunas rutas no están disponibles:', err.message);
}

// Rutas estáticas del portal
app.use('/portal', express.static('../resources'));

// RUTA RAÍZ
// Servir index.html para rutas no encontradas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    errorCode: err.code || 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor'
      : err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;