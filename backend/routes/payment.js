/**
 * Rutas de Pagos
 */
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { validateMobilePayment, validateClient } = require('../middleware/validation');

// POST iniciar pago
router.post('/initiate', validateMobilePayment, PaymentController.initiatePayment);

// GET estado de pago
router.get('/status/:transactionId', PaymentController.checkPaymentStatus);

// POST webhook callback Bancomercantil
router.post('/webhook/mercantil', PaymentController.webhookMercantilCallback);

module.exports = router;