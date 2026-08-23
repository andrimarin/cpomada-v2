/**
 * Servidor Express Principal
 * Portal Cautivo Omada con Pago Móvil Bancomercantil
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de API
app.use('/api/v1/plans', require('./routes/plans'));
app.use('/api/v1/payments', require('./routes/payment'));
app.use('/api/v1/sessions', require('./routes/sessions'));
app.use('/api/v1/omada', require('./routes/omada'));

// Rutas estáticas del portal
app.use('/portal', express.static('../resources'));

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
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏦 Banco: Bancomercantil`);
  console.log(`☁️  Omada: ${process.env.OMADA_CONTROLLER_TYPE === 'oc200' ? 'OC200' : 'Cloud'}`);
});