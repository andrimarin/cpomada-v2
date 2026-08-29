/**
 * Controlador de Planes
 */
const db = require('../config/database');

class PlanController {
  /**
   * Obtener todos los planes activos
   */
  static async getAllPlans(req, res) {
    try {
      const plans = await db.query(
        'SELECT id, name, hours, price, currency, description FROM plans WHERE is_active = TRUE ORDER BY hours ASC',
        []
      );

      return res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al obtener los planes'
      });
    }
  }

  /**
   * Obtener plan por ID
   */
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;

      const plans = await db.query(
        'SELECT id, name, hours, price, currency, description FROM plans WHERE id = ? AND is_active = TRUE',
        [id]
      );

      if (plans.length === 0) {
        return res.status(404).json({
          success: false,
          errorCode: 'PLAN_NOT_FOUND',
          message: 'Plan no encontrado'
        });
      }

      return res.json({
        success: true,
        data: plans[0]
      });
    } catch (error) {
      console.error('Error fetching plan:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al obtener el plan'
      });
    }
  }

  /**
   * Crear nuevo plan (admin)
   */
  static async createPlan(req, res) {
    try {
      const { name, hours, price, currency = 'VES', description } = req.body;

      if (!name || !hours || !price) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: name, hours, price'
        });
      }

      const result = await db.query(
        'INSERT INTO plans (name, hours, price, currency, description) VALUES (?, ?, ?, ?, ?)',
        [name, parseInt(hours), parseFloat(price), currency, description]
      );

      return res.status(201).json({
        success: true,
        message: 'Plan creado exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al crear el plan'
      });
    }
  }

  /**
   * Actualizar plan (admin)
   */
  static async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const { name, hours, price, currency, description, is_active } = req.body;

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (hours !== undefined) {
        updates.push('hours = ?');
        values.push(parseInt(hours));
      }
      if (price !== undefined) {
        updates.push('price = ?');
        values.push(parseFloat(price));
      }
      if (currency !== undefined) {
        updates.push('currency = ?');
        values.push(currency);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }

      values.push(id);

      await db.query(
        `UPDATE plans SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return res.json({
        success: true,
        message: 'Plan actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al actualizar el plan'
      });
    }
  }

  /**
   * Eliminar plan (admin)
   */
  static async deletePlan(req, res) {
    try {
      const { id } = req.params;

      await db.query(
        'UPDATE plans SET is_active = FALSE WHERE id = ?',
        [id]
      );

      return res.json({
        success: true,
        message: 'Plan eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'DB_ERROR',
        message: 'Error al eliminar el plan'
      });
    }
  }
}

module.exports = PlanController;