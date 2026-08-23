/**
 * Rutas de Planes
 */
const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/planController');

// GET todos los planes
router.get('/', PlanController.getAllPlans);

// GET plan por ID
router.get('/:id', PlanController.getPlanById);

// POST crear plan (requiere admin)
router.post('/', PlanController.createPlan);

// PUT actualizar plan (requiere admin)
router.put('/:id', PlanController.updatePlan);

// DELETE eliminar plan (requiere admin)
router.delete('/:id', PlanController.deletePlan);

module.exports = router;