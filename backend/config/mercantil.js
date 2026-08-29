/**
 * Configuración de API Bancomercantil
 */
require('dotenv').config();

const mercantilConfig = {
  // Sandbox
  sandbox: {
    baseUrl: 'https://apimbu.mercantilbanco.com/mercantil-banco/sandbox/v1',
    clientId: process.env.MERCANTIL_CLIENT_ID_SANDBOX,
    integratorId: parseInt(process.env.MERCANTIL_INTEGRATOR_ID) || 31,
    merchantId: parseInt(process.env.MERCANTIL_MERCHANT_ID),
    terminalId: process.env.MERCANTIL_TERMINAL_ID,
    encryptionKey: process.env.MERCANTIL_ENCRYPTION_KEY
  },
  // Producción
  production: {
    baseUrl: 'https://apimbu.mercantilbanco.com/mercantil-banco/production/v1',
    clientId: process.env.MERCANTIL_CLIENT_ID_PROD,
    integratorId: parseInt(process.env.MERCANTIL_INTEGRATOR_ID) || 31,
    merchantId: parseInt(process.env.MERCANTIL_MERCHANT_ID),
    terminalId: process.env.MERCANTIL_TERMINAL_ID,
    encryptionKey: process.env.MERCANTIL_ENCRYPTION_KEY
  }
};

// Seleccionar ambiente
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
const config = mercantilConfig[environment];

module.exports = {
  config,
  environment,
  // Constantes de pagos
  PAYMENT_METHODS: {
    C2P: 'c2p',        // Customer to Provider
    P2P: 'p2p',        // Person to Person
    TDC: 'tdc',        // Tarjeta de Crédito
    TDD: 'tdd'         // Tarjeta de Débito
  },
  TRANSACTION_TYPES: {
    PURCHASE: 'compra',
    REFUND: 'vuelto',
    CANCELLATION: 'anulacion'
  },
  CURRENCY: 'ves',
  MAX_RETRIES: 3,
  TIMEOUT: 30000 // 30 segundos
};