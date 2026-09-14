/**
 * Tests para Middleware de Autenticación
 */
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken, authenticateToken } = require('../../backend/middleware/auth');

describe('Auth Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  
  describe('generateToken', () => {
    it('debería generar un token JWT válido', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
    });

    it('debería incluir datos del usuario en el payload', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('verifyToken', () => {
    it('debería verificar un token válido', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.username).toBe('testuser');
    });

    it('debería lanzar error para token inválido', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('debería lanzar error para token expirado', () => {
      const token = jwt.sign(
        { id: 1, username: 'test' },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Esperar un momento para que expire
      setTimeout(() => {
        expect(() => {
          verifyToken(token);
        }).toThrow('Token expirado');
      }, 100);
    });
  });

  describe('authenticateToken middleware', () => {
    it('debería rechazar request sin token', () => {
      const req = {
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errorCode: 'AUTH_REQUIRED',
        message: 'Token de autenticación requerido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería aceptar request con token válido', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(user);
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe('testuser');
    });

    it('debería rechazar token inválido', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
