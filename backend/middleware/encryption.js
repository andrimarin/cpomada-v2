/**
 * Middleware de Encriptación/Desencriptación AES256
 * Compatible con API Bancomercantil
 */
const CryptoJS = require('crypto-js');

/**
 * Encriptar datos con AES256 ECB
 * @param {string} message - Mensaje a encriptar
 * @param {string} key - Clave secreta
 * @returns {string} Mensaje encriptado en Base64
 */
function encryptAES256(message, key) {
  if (!message || !key) {
    throw new Error('Message and key are required');
  }

  try {
    // Convertir clave a hash SHA256
    const cipherKey = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(key));
    
    // Obtener primeros 16 bytes del hash
    const keyString = cipherKey.toString();
    const firstHalf = keyString.slice(0, keyString.length / 2);
    const keyHex = CryptoJS.enc.Hex.parse(firstHalf);
    
    // Encriptar usando AES con modo ECB
    const encrypt = CryptoJS.AES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return CryptoJS.enc.Base64.stringify(encrypt.ciphertext);
  } catch (error) {
    console.error('Error encrypting:', error);
    throw error;
  }
}

/**
 * Desencriptar datos con AES256 ECB
 * @param {string} encryptedMessage - Mensaje encriptado
 * @param {string} key - Clave secreta
 * @returns {string} Mensaje desencriptado
 */
function decryptAES256(encryptedMessage, key) {
  if (!encryptedMessage || !key) {
    throw new Error('Encrypted message and key are required');
  }

  try {
    // Convertir clave a hash SHA256
    const cipherKey = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(key));
    
    // Obtener primeros 16 bytes del hash
    const keyString = cipherKey.toString();
    const firstHalf = keyString.slice(0, keyString.length / 2);
    const keyHex = CryptoJS.enc.Hex.parse(firstHalf);
    
    // Decodificar Base64
    const cipherBytes = CryptoJS.enc.Base64.parse(encryptedMessage);
    
    // Desencriptar
    const decrypt = CryptoJS.AES.decrypt(
      { ciphertext: cipherBytes },
      keyHex,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return CryptoJS.enc.Utf8.stringify(decrypt);
  } catch (error) {
    console.error('Error decrypting:', error);
    throw error;
  }
}

/**
 * Encriptar datos sensibles para Bancomercantil
 * Datos que se encriptan: CVV, contraseñas, 2FA, ID, números de teléfono
 */
function encryptSensitiveData(data, key) {
  const encrypted = {};
  
  if (data.cvv) encrypted.cvv = encryptAES256(data.cvv, key);
  if (data.password) encrypted.password = encryptAES256(data.password, key);
  if (data.twofactor_auth) encrypted.twofactor_auth = encryptAES256(data.twofactor_auth, key);
  if (data.destination_id) encrypted.destination_id = encryptAES256(data.destination_id, key);
  if (data.destination_mobile_number) {
    encrypted.destination_mobile_number = encryptAES256(data.destination_mobile_number, key);
  }
  if (data.issuer_customer_id) encrypted.issuer_customer_id = encryptAES256(data.issuer_customer_id, key);
  if (data.account) encrypted.account = encryptAES256(data.account, key);
  
  return encrypted;
}

/**
 * Middleware Express para validar y encriptar payloads
 */
function encryptionMiddleware(req, res, next) {
  // Guardar body original
  const originalBody = req.body;
  
  // Pasar métodos de encriptación al request
  req.encrypt = (data) => encryptAES256(data, process.env.MERCANTIL_ENCRYPTION_KEY);
  req.decrypt = (data) => decryptAES256(data, process.env.MERCANTIL_ENCRYPTION_KEY);
  req.encryptSensitive = (data) => encryptSensitiveData(data, process.env.MERCANTIL_ENCRYPTION_KEY);
  
  next();
}

module.exports = {
  encryptAES256,
  decryptAES256,
  encryptSensitiveData,
  encryptionMiddleware
};