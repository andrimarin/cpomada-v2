/**
 * Middleware de Validaciones
 */
const validator = require('validator');

/**
 * Validar formato de número de teléfono
 * Formato esperado: +584XX-XXXXXXX
 */
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+58[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, '+'));
}

/**
 * Validar dirección MAC
 */
function validateMacAddress(mac) {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Validar monto (debe ser positivo y válido)
 */
function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 999999.99;
}

/**
 * Validar referencia de pago
 */
function validatePaymentReference(reference) {
  return validator.isLength(reference, { min: 1, max: 100 }) && 
         /^[a-zA-Z0-9\-_]+$/.test(reference);
}

/**
 * Middleware para validar pago móvil
 */
function validateMobilePayment(req, res, next) {
  const { phone_number, amount, plan_id, client_mac } = req.body;

  const errors = [];

  if (!phone_number) {
    errors.push('Número de teléfono es requerido');
  } else if (!validatePhoneNumber(phone_number)) {
    errors.push('Formato de teléfono inválido. Use: +58XXXXXXXXXX');
  }

  if (!amount) {
    errors.push('Monto es requerido');
  } else if (!validateAmount(amount)) {
    errors.push('Monto debe ser positivo y menor a 999,999.99');
  }

  if (!plan_id) {
    errors.push('Plan es requerido');
  } else if (!validator.isInt(plan_id.toString())) {
    errors.push('ID de plan inválido');
  }

  if (client_mac && !validateMacAddress(client_mac)) {
    errors.push('Dirección MAC inválida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Errores de validación',
      errors
    });
  }

  next();
}

/**
 * Middleware para validar cliente
 */
function validateClient(req, res, next) {
  const { client_mac, ap_mac, gateway_mac } = req.query;

  if (!client_mac) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_CLIENT_MAC',
      message: 'Dirección MAC del cliente es requerida'
    });
  }

  if (!validateMacAddress(client_mac)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MAC',
      message: 'Dirección MAC del cliente inválida'
    });
  }

  next();
}

/**
 * Middleware para validar IPs
 */
function validateIP(ip) {
  return validator.isIP(ip);
}

module.exports = {
  validatePhoneNumber,
  validateMacAddress,
  validateAmount,
  validatePaymentReference,
  validateMobilePayment,
  validateClient,
  validateIP
};