/**
 * Rutas de Integración Omada
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/database');
const { config, activeController, OMADA_ENDPOINTS } = require('../config/omada');

class OmadaService {
  static async authenticate() {
    try {
      const loginUrl = config.baseUrl + OMADA_ENDPOINTS.LOGIN;
      
      const response = await axios.post(loginUrl, {
        username: config.username,
        password: config.password
      }, {
        timeout: config.timeout,
        validateStatus: () => true
      });

      if (response.data.errorCode === 0) {
        return response.data.result.token;
      }
      throw new Error('Autenticación Omada fallida');
    } catch (error) {
      console.error('Omada auth error:', error.message);
      throw error;
    }
  }

  static async authorizeClient(clientMac, token) {
    try {
      const authUrl = config.baseUrl + OMADA_ENDPOINTS.PORTAL_LOGIN;
      
      const response = await axios.post(authUrl, {
        clientMac,
        authType: 0  // Free access
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: config.timeout,
        validateStatus: () => true
      });

      return response.data;
    } catch (error) {
      console.error('Omada authorization error:', error.message);
      throw error;
    }
  }

  static async getClientInfo(clientMac, token) {
    try {
      const clientUrl = config.baseUrl + `/v2/api/client?mac=${clientMac}`;
      
      const response = await axios.get(clientUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: config.timeout,
        validateStatus: () => true
      });

      return response.data;
    } catch (error) {
      console.error('Error getting client info:', error.message);
      throw error;
    }
  }
}

/**
 * GET obtener configuración del portal Omada
 */
router.get('/portal-settings', async (req, res) => {
  try {
    const { clientMac, apMac, ssidName, radioId, vid } = req.query;

    const settings = {
      authType: 11,  // Hotspot selection
      hotspot: {
        enabledTypes: [3, 5, 6, 8]  // Voucher, Local User, SMS, RADIUS
      },
      error: 'ok',
      landingUrl: process.env.LANDING_URL || 'http://localhost:3000',
      sms: {
        countryCode: 58
      }
    };

    return res.json({
      errorCode: 0,
      result: settings
    });
  } catch (error) {
    console.error('Error getting portal settings:', error);
    return res.status(500).json({
      errorCode: -1,
      message: 'Error al obtener configuración'
    });
  }
});

/**
 * POST autenticar cliente en WiFi
 */
router.post('/auth', async (req, res) => {
  try {
    const { clientMac, planId } = req.body;

    if (!clientMac || !planId) {
      return res.status(400).json({
        success: false,
        message: 'clientMac y planId son requeridos'
      });
    }

    // Obtener token Omada
    const token = await OmadaService.authenticate();

    // Autorizar cliente
    const authResult = await OmadaService.authorizeClient(clientMac, token);

    if (authResult.errorCode === 0) {
      // Crear sesión WiFi en BD
      const sessionId = `SESS-${Date.now()}`;
      
      await db.query(
        `INSERT INTO wifi_sessions (session_id, client_mac, plan_id, status)
         VALUES (?, ?, ?, ?)`,
        [sessionId, clientMac, planId, 'active']
      );

      return res.json({
        success: true,
        sessionId,
        message: 'Cliente autenticado en WiFi'
      });
    } else {
      return res.status(400).json({
        success: false,
        errorCode: authResult.errorCode,
        message: authResult.message || 'Error al autenticar en Omada'
      });
    }
  } catch (error) {
    console.error('Error in auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar autenticación'
    });
  }
});

/**
 * GET información del cliente desde Omada
 */
router.get('/client/:clientMac', async (req, res) => {
  try {
    const { clientMac } = req.params;

    const token = await OmadaService.authenticate();
    const clientInfo = await OmadaService.getClientInfo(clientMac, token);

    return res.json({
      success: true,
      data: clientInfo
    });
  } catch (error) {
    console.error('Error getting client info:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información del cliente'
    });
  }
});

/**
 * POST desautenticar cliente
 */
router.post('/logout/:clientMac', async (req, res) => {
  try {
    const { clientMac } = req.params;

    // Marcar sesión como expirada
    await db.query(
      `UPDATE wifi_sessions SET status = 'expired' 
       WHERE client_mac = ? AND status = 'active'`,
      [clientMac]
    );

    return res.json({
      success: true,
      message: 'Cliente desautenticado'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al desautenticar'
    });
  }
});

module.exports = router;