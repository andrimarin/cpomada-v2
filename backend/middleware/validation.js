/**
 * Middleware de Validaciones
 */
const validator = require('validator');

/**
 * Validar formato de número de teléfono
 * Acepta formatos: +584147979209, 584147979209, 0414-7979209
 * Formato esperado internamente: +58XXXXXXXXXX
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;
  
  // Eliminar espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Regex que acepta: +58 + 10 dígitos, o 58 + 10 dígitos, o 0 + 9 dígitos (local)
  const phoneRegex = /^(\+58|58)?[0-9]{10}$/;
  const localRegex = /^0[0-9]{9}$/;
  
  return phoneRegex.test(cleaned) || localRegex.test(cleaned);
}

/**
 * Normalizar número de teléfono al formato internacional +58XXXXXXXXXX
 */
function normalizePhoneNumber(phone) {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si ya tiene +58 al inicio
  if (/^\+58[0-9]{10}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Si tiene 58 al inicio (sin +)
  if (/^58[0-9]{10}$/.test(cleaned)) {
    return '+' + cleaned;
  }
  
  // Si es formato local (0 + 9 dígitos)
  if (/^0[0-9]{9}$/.test(cleaned)) {
    return '+58' + cleaned.substring(1);
  }
  
  // Si tiene 10 dígitos sin código de país, asumir Venezuela
  if (/^[0-9]{10}$/.test(cleaned)) {
    return '+58' + cleaned;
  }
  
  // Por defecto, agregar +
  return '+' + cleaned;
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
  // Aceptar tanto 'phone' como 'phone_number'
  const phoneRaw = req.body.phone || req.body.phone_number;
  const { amount, plan_id, client_mac } = req.body;

  const errors = [];

  if (!phoneRaw) {
    errors.push('Número de teléfono es requerido');
  } else if (!validatePhoneNumber(phoneRaw)) {
    errors.push('Formato de teléfono inválido. Use: 584147979209 o +584147979209');
  } else {
    // Normalizar el número al formato +58XXXXXXXXXX
    req.body.phone_number = normalizePhoneNumber(phoneRaw);
    req.body.phone = req.body.phone_number;
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
  normalizePhoneNumber,
  validateMacAddress,
  validateAmount,
  validatePaymentReference,
  validateMobilePayment,
  validateClient,
  validateIP
};