/**
 * Rutas de Autenticación
 */
const express = require('express');
const router = express.Router();
const { AuthController, authenticateToken } = require('../middleware/auth');

// POST /api/v1/auth/login - Iniciar sesión
router.post('/login', AuthController.login);

// POST /api/v1/auth/verify - Verificar token
router.post('/verify', AuthController.verify);

// POST /api/v1/auth/refresh - Renovar token (requiere auth)
router.post('/refresh', authenticateToken, AuthController.refresh);

// POST /api/v1/auth/logout - Cerrar sesión (requiere auth)
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
