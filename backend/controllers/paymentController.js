/**
 * Controlador de Pagos - Integración Bancomercantil
 */
const axios = require('axios');
const db = require('../config/database');
const { config } = require('../config/mercantil');
const { encryptSensitiveData } = require('../middleware/encryption');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class PaymentController {
  /**
   * Iniciar pago móvil C2P
   */
  static async initiatePayment(req, res) {
    const connection = await db.beginTransaction();

    try {
      const {
        phone_number,
        plan_id,
        client_mac,
        ap_mac,
        gateway_mac,
        ssid_name,
        radio_id,
        vid,
        origin_url
      } = req.body;

      // Validar plan existe y obtener precio
      const plans = await db.query(
        'SELECT id, price, hours FROM plans WHERE id = ? AND is_active = TRUE',
        [plan_id]
      );

      if (plans.length === 0) {
        return res.status(404).json({
          success: false,
          errorCode: 'PLAN_NOT_FOUND',
          message: 'Plan no encontrado'
        });
      }

      const plan = plans[0];
      const transactionId = `TRX-${uuidv4()}`;
      const invoiceNumber = `INV-${Date.now()}-${plan_id}`;
      const paymentReference = `WIFI-${client_mac.replace(/:/g, '').toUpperCase().slice(-8)}-${plan_id}`;

      // Crear registro de transacción
      await connection.execute(
        `INSERT INTO transactions 
        (transaction_id, client_mac, phone_number, plan_id, amount, currency, status, payment_reference, invoice_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          client_mac,
          phone_number,
          plan_id,
          plan.price,
          'VES',
          'pending',
          paymentReference,
          invoiceNumber
        ]
      );

      // Preparar payload para Bancomercantil
      const paymentPayload = {
        merchant_identify: {
          integratorId: config.integratorId,
          merchantId: config.merchantId,
          terminalId: config.terminalId
        },
        client_identify: {
          ipaddress: req.ip || '127.0.0.1',
          browser_agent: req.get('user-agent') || 'Unknown',
          mobile: {
            manufacturer: 'WiFi Portal'
          }
        },
        transaction_c2p: {
          amount: parseFloat(plan.price),
          currency: 'ves',
          destination_bank_id: '0102',  // Bancomercantil
          destination_id: '',           // Se encripta después
          destination_mobile_number: phone_number,
          origin_mobile_number: '',
          payment_reference: paymentReference,
          trx_type: 'compra',
          payment_method: 'c2p',
          invoice_number: invoiceNumber,
          twofactor_auth: ''             // Se encripta después si es necesario
        }
      };

      // Encriptar datos sensibles
      const encryptedData = encryptSensitiveData(
        {
          destination_mobile_number: phone_number
        },
        config.encryptionKey
      );

      paymentPayload.transaction_c2p.destination_mobile_number = encryptedData.destination_mobile_number;

      // Enviar a Bancomercantil
      const mercantilResponse = await this._callMercantilAPI(
        '/payment/c2p',
        'POST',
        paymentPayload
      );

      if (mercantilResponse.status === 'success' || mercantilResponse.errorCode === '0') {
        // Actualizar transacción como procesando
        await connection.execute(
          'UPDATE transactions SET status = ?, mercantil_response = ? WHERE transaction_id = ?',
          ['processing', JSON.stringify(mercantilResponse), transactionId]
        );

        await connection.commit();

        return res.json({
          success: true,
          transactionId,
          paymentReference,
          amount: plan.price,
          currency: 'VES',
          plan: {
            id: plan.id,
            hours: plan.hours
          },
          redirectUrl: mercantilResponse.redirectUrl || null,
          message: 'Pago iniciado, por favor complete la transacción en su banco'
        });
      } else {
        // Error en Bancomercantil
        await connection.execute(
          'UPDATE transactions SET status = ?, error_message = ?, error_code = ?, mercantil_response = ? WHERE transaction_id = ?',
          [
            'failed',
            mercantilResponse.message || 'Error desconocido',
            mercantilResponse.errorCode || 'UNKNOWN',
            JSON.stringify(mercantilResponse),
            transactionId
          ]
        );

        await connection.commit();

        return res.status(400).json({
          success: false,
          errorCode: mercantilResponse.errorCode || 'PAYMENT_ERROR',
          message: mercantilResponse.message || 'Error al procesar el pago',
          transactionId
        });
      }
    } catch (error) {
      await connection.rollback();
      console.error('Error initiating payment:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'PAYMENT_ERROR',
        message: 'Error al procesar el pago'
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Verificar estado de pago
   */
  static async checkPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;

      const transactions = await db.query(
        'SELECT * FROM transactions WHERE transaction_id = ?',
        [transactionId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          errorCode: 'TRANSACTION_NOT_FOUND',
          message: 'Transacción no encontrada'
        });
      }

      const transaction = transactions[0];

      return res.json({
        success: true,
        data: {
          transactionId: transaction.transaction_id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          phone: transaction.phone_number.slice(-8) + '****',
          planId: transaction.plan_id,
          createdAt: transaction.created_at,
          errorCode: transaction.error_code,
          errorMessage: transaction.error_message
        }
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al verificar el estado del pago'
      });
    }
  }

  /**
   * Webhook para confirmación de Bancomercantil
   */
  static async webhookMercantilCallback(req, res) {
    try {
      const { transactionId, status, errorCode, message } = req.body;

      const connection = await db.beginTransaction();

      try {
        // Buscar transacción
        const transactions = await db.query(
          'SELECT * FROM transactions WHERE payment_reference = ?',
          [transactionId]
        );

        if (transactions.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Transacción no encontrada'
          });
        }

        const transaction = transactions[0];

        if (status === 'completed' || errorCode === '0') {
          // Pago exitoso
          await connection.execute(
            'UPDATE transactions SET status = ? WHERE id = ?',
            ['completed', transaction.id]
          );

          // Crear sesión WiFi
          const sessionId = `SESS-${uuidv4()}`;
          const endTime = new Date(Date.now() + transaction.hours * 3600000);

          await connection.execute(
            `INSERT INTO wifi_sessions 
            (session_id, client_mac, transaction_id, ap_mac, gateway_mac, ssid_name, radio_id, vid, plan_id, end_time, duration_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sessionId,
              transaction.client_mac,
              transaction.id,
              '',
              '',
              '',
              null,
              null,
              transaction.plan_id,
              endTime,
              2 // Placeholder
            ]
          );

          await connection.commit();

          // Notificar a Omada
          await this._notifyOmadaAuth(transaction.client_mac, sessionId);

          return res.json({
            success: true,
            message: 'Pago confirmado',
            sessionId
          });
        } else {
          // Pago fallido
          await connection.execute(
            'UPDATE transactions SET status = ?, error_code = ?, error_message = ? WHERE id = ?',
            ['failed', errorCode, message, transaction.id]
          );

          await connection.commit();

          return res.status(400).json({
            success: false,
            message: 'Pago rechazado',
            errorCode,
            errorMessage: message
          });
        }
      } catch (innerError) {
        await connection.rollback();
        throw innerError;
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el webhook'
      });
    }
  }

  /**
   * Llamar API Bancomercantil
   */
  static async _callMercantilAPI(endpoint, method = 'POST', data) {
    try {
      const url = config.baseUrl + endpoint;

      const response = await axios({
        url,
        method,
        data,
        headers: {
          'X-IBM-Client-ID': config.clientId,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Mercantil API error:', error.response?.data || error.message);
      return {
        success: false,
        errorCode: error.response?.data?.errorCode || 'API_ERROR',
        message: error.response?.data?.message || 'Error al conectar con Bancomercantil'
      };
    }
  }

  /**
   * Notificar a Omada la autenticación exitosa
   */
  static async _notifyOmadaAuth(clientMac, sessionId) {
    // Este método será implementado en el controlador de Omada
    console.log(`WiFi Session created for ${clientMac}: ${sessionId}`);
  }
}

module.exports = PaymentController;