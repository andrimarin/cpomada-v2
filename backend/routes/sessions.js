/**
 * Rutas de Sesiones WiFi
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET verificar sesión activa
 */
router.get('/check/:clientMac', async (req, res) => {
  try {
    const { clientMac } = req.params;

    const sessions = await db.query(
      `SELECT * FROM wifi_sessions 
       WHERE client_mac = ? AND status = 'active' AND end_time > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [clientMac]
    );

    if (sessions.length === 0) {
      return res.json({
        success: true,
        active: false,
        message: 'No hay sesión activa'
      });
    }

    const session = sessions[0];
    const timeRemaining = Math.ceil((new Date(session.end_time) - new Date()) / 1000 / 3600);

    return res.json({
      success: true,
      active: true,
      session: {
        sessionId: session.session_id,
        startTime: session.start_time,
        endTime: session.end_time,
        hoursRemaining: timeRemaining,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar sesión'
    });
  }
});

/**
 * GET obtener historial de sesiones
 */
router.get('/history/:clientMac', async (req, res) => {
  try {
    const { clientMac } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const sessions = await db.query(
      `SELECT s.session_id, s.start_time, s.end_time, s.status, p.name, p.hours, p.price
       FROM wifi_sessions s
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.client_mac = ?
       ORDER BY s.created_at DESC
       LIMIT ?`,
      [clientMac, limit]
    );

    return res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial'
    });
  }
});

/**
 * POST extender sesión (requiere pago)
 */
router.post('/extend', async (req, res) => {
  try {
    const { clientMac, additionalHours } = req.body;

    if (!clientMac || !additionalHours) {
      return res.status(400).json({
        success: false,
        message: 'clientMac y additionalHours son requeridos'
      });
    }

    // Buscar sesión activa
    const sessions = await db.query(
      `SELECT * FROM wifi_sessions 
       WHERE client_mac = ? AND status = 'active' AND end_time > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [clientMac]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay sesión activa para extender'
      });
    }

    const session = sessions[0];
    const newEndTime = new Date(new Date(session.end_time).getTime() + additionalHours * 3600000);

    await db.query(
      'UPDATE wifi_sessions SET end_time = ?, duration_hours = duration_hours + ? WHERE id = ?',
      [newEndTime, additionalHours, session.id]
    );

    return res.json({
      success: true,
      message: 'Sesión extendida exitosamente',
      newEndTime
    });
  } catch (error) {
    console.error('Error extending session:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al extender sesión'
    });
  }
});

module.exports = router;