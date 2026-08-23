/**
 * Configuración de Omada Controllers
 * Soporta Omada Cloud y OC200
 */
require('dotenv').config();

const omadaConfig = {
  // Omada Cloud
  cloud: {
    type: 'cloud',
    baseUrl: process.env.OMADA_CLOUD_URL || 'https://cloud.omadanetwork.com',
    siteId: process.env.OMADA_SITE_ID,
    clientId: process.env.OMADA_CLIENT_ID,
    clientSecret: process.env.OMADA_CLIENT_SECRET,
    username: process.env.OMADA_USERNAME,
    password: process.env.OMADA_PASSWORD,
    timeout: 30000
  },
  // Omada OC200 (Hardware Controller)
  oc200: {
    type: 'hardware',
    baseUrl: process.env.OMADA_OC200_URL || 'http://localhost:8043',
    siteId: process.env.OMADA_OC200_SITE_ID,
    username: process.env.OMADA_OC200_USERNAME,
    password: process.env.OMADA_OC200_PASSWORD,
    timeout: 30000,
    verifySsl: process.env.OMADA_OC200_VERIFY_SSL === 'true'
  }
};

// Seleccionar controlador activo
const activeController = process.env.OMADA_CONTROLLER_TYPE === 'oc200' ? 'oc200' : 'cloud';
const config = omadaConfig[activeController];

// Endpoints de API Omada
const OMADA_ENDPOINTS = {
  // Autenticación
  LOGIN: '/v2/api/authentication/login',
  LOGOUT: '/v2/api/authentication/logout',
  
  // Portales
  PORTAL_LOGIN: '/v2/api/portal/auth',
  PORTAL_GUEST_PASS: '/v2/api/portal/guest-pass',
  
  // Usuarios
  GUEST_USER: '/v2/api/guest/user',
  GUEST_DEVICE: '/v2/api/guest/device',
  
  // Obtener configuración del portal
  PORTAL_SETTING: '/v2/api/portal/page-setting',
  
  // Clientes/Dispositivos conectados
  CLIENT: '/v2/api/client',
  CLIENTS: '/v2/api/clients',
  
  // Redes y AP
  DEVICE: '/v2/api/device',
  AP: '/v2/api/ap'
};

module.exports = {
  config,
  activeController,
  OMADA_ENDPOINTS
};