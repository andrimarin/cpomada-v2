/**
 * Rutas de Planes
 */
const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/planController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET todos los planes (público)
router.get('/', PlanController.getAllPlans);

// GET plan por ID (público)
router.get('/:id', PlanController.getPlanById);

// POST crear plan (requiere autenticación y rol admin)
router.post('/', authenticateToken, requireAdmin, PlanController.createPlan);

// PUT actualizar plan (requiere autenticación y rol admin)
router.put('/:id', authenticateToken, requireAdmin, PlanController.updatePlan);

// DELETE eliminar plan (requiere autenticación y rol admin)
router.delete('/:id', authenticateToken, requireAdmin, PlanController.deletePlan);

module.exports = router;