/**
 * Controlador de Omada - Integración con Omada Cloud/OC200
 */
const axios = require('axios');
const https = require('https');
const { config, OMADA_ENDPOINTS } = require('../config/omada');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class OmadaController {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    // Crear agente HTTPS para ignorar certificados self-signed en OC200
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: config.verifySsl !== false
    });
  }

  /**
   * Autenticar con Omada Controller
   */
  async login() {
    try {
      // Verificar si tenemos un token válido
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const url = `${config.baseUrl}${OMADA_ENDPOINTS.LOGIN}`;
      
      const payload = {
        userName: config.username,
        password: config.password
      };

      const response = await axios.post(url, payload, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.result && response.data.result.token) {
        this.token = response.data.result.token;
        // Token válido por 5 minutos (renovar antes de que expire)
        this.tokenExpiry = Date.now() + (5 * 60 * 1000) - 30000;
        
        console.log('✅ Omada login exitoso');
        return this.token;
      } else {
        throw new Error('Token no recibido en respuesta de Omada');
      }
    } catch (error) {
      console.error('Error en login de Omada:', error.response?.data || error.message);
      throw new Error(`Falló autenticación con Omada: ${error.message}`);
    }
  }

  /**
   * Cerrar sesión en Omada
   */
  async logout() {
    try {
      if (!this.token) {
        return;
      }

      const url = `${config.baseUrl}${OMADA_ENDPOINTS.LOGOUT}`;
      
      await axios.post(url, {}, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Csrf-Token': this.token
        }
      });

      this.token = null;
      this.tokenExpiry = null;
      console.log('✅ Omada logout exitoso');
    } catch (error) {
      console.error('Error en logout de Omada:', error.response?.data || error.message);
      // No lanzar error, solo loguear
    }
  }

  /**
   * Autorizar cliente por MAC address (después de pago exitoso)
   */
  async authorizeClient(clientMac, durationMinutes, sessionId) {
    try {
      const token = await this.login();
      const url = `${config.baseUrl}${OMADA_ENDPOINTS.PORTAL_AUTH}`;

      const payload = {
        clientMac: clientMac,
        authType: 3, // 3 = voucher/time-based
        time: durationMinutes,
        appId: sessionId
      };

      const response = await axios.post(url, payload, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Csrf-Token': token
        }
      });

      if (response.data && response.data.result && response.data.result.responseCode === 0) {
        console.log(`✅ Cliente ${clientMac} autorizado por ${durationMinutes} minutos`);
        return {
          success: true,
          clientMac,
          duration: durationMinutes,
          sessionId
        };
      } else {
        throw new Error(response.data?.result?.msg || 'Error al autorizar cliente');
      }
    } catch (error) {
      console.error('Error al autorizar cliente:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
        clientMac
      };
    }
  }

  /**
   * Desautenticar cliente (logout manual)
   */
  async disconnectClient(clientMac) {
    try {
      const token = await this.login();
      const url = `${config.baseUrl}${OMADA_ENDPOINTS.PORTAL_LOGOUT}`;

      const payload = {
        clientMac: clientMac
      };

      const response = await axios.post(url, payload, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Csrf-Token': token
        }
      });

      if (response.data && response.data.result && response.data.result.responseCode === 0) {
        console.log(`✅ Cliente ${clientMac} desautenticado`);
        return { success: true, clientMac };
      } else {
        throw new Error(response.data?.result?.msg || 'Error al desautenticar cliente');
      }
    } catch (error) {
      console.error('Error al desautenticar cliente:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
        clientMac
      };
    }
  }

  /**
   * Obtener información del cliente
   */
  async getClientInfo(clientMac) {
    try {
      const token = await this.login();
      const url = `${config.baseUrl}${OMADA_ENDPOINTS.CLIENT}/${clientMac}`;

      const response = await axios.get(url, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Csrf-Token': token
        }
      });

      if (response.data && response.data.result) {
        return {
          success: true,
          data: response.data.result
        };
      } else {
        throw new Error('Cliente no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener info del cliente:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
        clientMac
      };
    }
  }

  /**
   * Obtener configuración del portal
   */
  async getPortalSettings() {
    try {
      const token = await this.login();
      const url = `${config.baseUrl}${OMADA_ENDPOINTS.PORTAL_SETTING}`;

      const response = await axios.get(url, {
        timeout: config.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'Csrf-Token': token
        }
      });

      if (response.data && response.data.result) {
        return {
          success: true,
          data: response.data.result
        };
      } else {
        throw new Error('No se pudo obtener configuración del portal');
      }
    } catch (error) {
      console.error('Error al obtener configuración del portal:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crear sesión WiFi en base de datos y autorizar en Omada
   */
  async createWifiSession(transactionData) {
    const connection = await db.beginTransaction();

    try {
      const {
        client_mac,
        transaction_id,
        plan_id,
        ap_mac = '',
        gateway_mac = '',
        ssid_name = '',
        radio_id = null,
        vid = null
      } = transactionData;

      // Obtener duración del plan
      const plans = await db.query(
        'SELECT hours FROM plans WHERE id = ?',
        [plan_id]
      );

      if (plans.length === 0) {
        throw new Error('Plan no encontrado');
      }

      const durationHours = plans[0].hours;
      const durationMinutes = durationHours * 60;
      const endTime = new Date(Date.now() + durationMinutes * 60000);

      // Crear sesión en BD
      const sessionId = `SESS-${uuidv4()}`;
      
      await connection.execute(
        `INSERT INTO wifi_sessions
        (session_id, client_mac, transaction_id, ap_mac, gateway_mac, ssid_name, radio_id, vid, plan_id, end_time, duration_hours, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          sessionId,
          client_mac,
          transaction_id,
          ap_mac,
          gateway_mac,
          ssid_name,
          radio_id,
          vid,
          plan_id,
          endTime,
          durationHours
        ]
      );

      await connection.commit();

      // Autorizar en Omada
      const omadaResult = await this.authorizeClient(client_mac, durationMinutes, sessionId);

      if (!omadaResult.success) {
        console.warn(`⚠️ Sesión creada en BD pero falló autorización en Omada: ${omadaResult.error}`);
      }

      return {
        success: true,
        sessionId,
        clientMac: client_mac,
        duration: durationMinutes,
        endTime,
        omadaAuthorized: omadaResult.success
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error al crear sesión WiFi:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verificar y expirar sesiones antiguas
   */
  async expireOldSessions() {
    try {
      const now = new Date();
      
      // Buscar sesiones activas que hayan expirado
      const expiredSessions = await db.query(
        `SELECT id, session_id, client_mac 
         FROM wifi_sessions 
         WHERE status = 'active' AND end_time < ?`,
        [now]
      );

      if (expiredSessions.length === 0) {
        return { success: true, expired: 0 };
      }

      const connection = await db.beginTransaction();

      try {
        // Marcar sesiones como expiradas en BD
        await connection.execute(
          `UPDATE wifi_sessions SET status = 'expired' WHERE status = 'active' AND end_time < ?`,
          [now]
        );

        await connection.commit();

        // Desautenticar clientes en Omada
        for (const session of expiredSessions) {
          await this.disconnectClient(session.client_mac);
        }

        console.log(`✅ ${expiredSessions.length} sesiones expiradas`);

        return {
          success: true,
          expired: expiredSessions.length,
          sessions: expiredSessions.map(s => s.client_mac)
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error al expirar sesiones:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OmadaController();
