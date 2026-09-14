/**
 * Middleware de Autenticación JWT
 */
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generar token JWT
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'admin',
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verificar token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
}

/**
 * Middleware para proteger rutas
 */
function authenticateToken(req, res, next) {
  // Obtener token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      errorCode: 'AUTH_REQUIRED',
      message: 'Token de autenticación requerido'
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Agregar usuario decodificado al request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      errorCode: 'INVALID_TOKEN',
      message: error.message || 'Token inválido o expirado'
    });
  }
}

/**
 * Middleware para verificar rol de administrador
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      errorCode: 'AUTH_REQUIRED',
      message: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      errorCode: 'INSUFFICIENT_PERMISSIONS',
      message: 'Permisos insuficientes. Se requiere rol de administrador.'
    });
  }

  next();
}

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * Login de administrador
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          errorCode: 'MISSING_CREDENTIALS',
          message: 'Usuario y contraseña son requeridos'
        });
      }

      // En producción, verificar contra base de datos
      // Por ahora, credenciales hardcoded para demo
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        // Registrar intento fallido en auditoría
        await db.query(
          `INSERT INTO audit_logs (event_type, action, ip_address, user_agent, new_value)
           VALUES ('auth_failed', 'login', ?, ?, ?)`,
          [req.ip, req.get('user-agent'), JSON.stringify({ username })]
        );

        return res.status(401).json({
          success: false,
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas'
        });
      }

      // Crear usuario simulado (en producción vendría de BD)
      const user = {
        id: 1,
        username: username,
        email: 'admin@example.com',
        role: 'admin'
      };

      // Generar token
      const token = generateToken(user);

      // Registrar login exitoso en auditoría
      await db.query(
        `INSERT INTO audit_logs (event_type, action, ip_address, user_agent, new_value)
         VALUES ('auth_success', 'login', ?, ?, ?)`,
        [req.ip, req.get('user-agent'), JSON.stringify({ username, userId: user.id })]
      );

      return res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        expiresIn: JWT_EXPIRES_IN
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'LOGIN_ERROR',
        message: 'Error al iniciar sesión'
      });
    }
  }

  /**
   * Verificar token válido
   */
  static async verify(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          errorCode: 'TOKEN_REQUIRED',
          message: 'Token requerido'
        });
      }

      const decoded = verifyToken(token);

      return res.json({
        success: true,
        valid: true,
        user: decoded,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (error) {
      return res.json({
        success: false,
        valid: false,
        error: error.message
      });
    }
  }

  /**
   * Refresh token
   */
  static async refresh(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errorCode: 'AUTH_REQUIRED',
          message: 'Autenticación requerida'
        });
      }

      // Generar nuevo token
      const newToken = generateToken(req.user);

      return res.json({
        success: true,
        message: 'Token renovado',
        token: newToken,
        expiresIn: JWT_EXPIRES_IN
      });
    } catch (error) {
      console.error('Error al renovar token:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'REFRESH_ERROR',
        message: 'Error al renovar el token'
      });
    }
  }

  /**
   * Logout (invalidar token del lado cliente)
   */
  static async logout(req, res) {
    try {
      // Registrar logout en auditoría
      if (req.user) {
        await db.query(
          `INSERT INTO audit_logs (event_type, action, ip_address, user_agent, new_value)
           VALUES ('auth_logout', 'logout', ?, ?, ?)`,
          [req.ip, req.get('user-agent'), JSON.stringify({ userId: req.user.id })]
        );
      }

      return res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      return res.status(500).json({
        success: false,
        errorCode: 'LOGOUT_ERROR',
        message: 'Error al cerrar sesión'
      });
    }
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireAdmin,
  AuthController
};
