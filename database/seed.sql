-- Datos iniciales para Portal Cautivo Omada

-- Planes disponibles
INSERT INTO plans (name, hours, price, currency, description, is_active) VALUES
('1 Hora', 1, 1.50, 'VES', 'Acceso WiFi por 1 hora sin expiración ni pausas', TRUE),
('2 Horas', 2, 2.50, 'VES', 'Acceso WiFi por 2 horas sin expiración ni pausas', TRUE),
('4 Horas', 4, 4.00, 'VES', 'Acceso WiFi por 4 horas sin expiración ni pausas', TRUE),
('8 Horas', 8, 7.00, 'VES', 'Acceso WiFi por 8 horas sin expiración ni pausas', TRUE),
('24 Horas', 24, 12.00, 'VES', 'Acceso WiFi por 1 día completo sin expiración ni pausas', TRUE),
('3 Días', 72, 25.00, 'VES', 'Acceso WiFi por 3 días sin expiración ni pausas', TRUE),
('7 Días', 168, 50.00, 'VES', 'Acceso WiFi por 1 semana sin expiración ni pausas', TRUE),
('30 Días', 720, 150.00, 'VES', 'Acceso WiFi por 30 días sin expiración ni pausas', TRUE);

-- Códigos de error Bancomercantil
INSERT INTO payment_errors (error_code, error_message, description_es, severity, retryable) VALUES
('0', 'Operación exitosa', 'Pago procesado correctamente', 'info', FALSE),
('-1', 'Error general', 'Error no especificado en la operación', 'error', TRUE),
('-41500', 'Tipo de autenticación inválido', 'El tipo de autenticación no es soportado', 'error', FALSE),
('-41501', 'Error de autenticación', 'Falló la autenticación del usuario', 'error', FALSE),
('-41502', 'Código voucher incorrecto', 'El código de voucher ingresado no es válido', 'warning', FALSE),
('-41503', 'Voucher expirado', 'El voucher ha expirado', 'warning', FALSE),
('-41504', 'Límite de tráfico excedido', 'El voucher ha alcanzado su límite de datos', 'warning', FALSE),
('-41505', 'Límite de usuarios alcanzado', 'Se alcanzó el máximo número de usuarios', 'warning', FALSE),
('-41506', 'Información de autorización inválida', 'Los datos de autorización son incorrectos', 'error', FALSE),
('-41507', 'Autenticación expirada', 'La autenticación ha expirado, intente nuevamente mañana', 'info', FALSE),
('-41517', 'Contraseña incorrecta', 'La contraseña ingresada no es válida', 'warning', FALSE),
('-41518', 'SSID no existe', 'La red solicitada no existe', 'error', FALSE),
('-41519', 'Código inválido', 'El código ingresado no es válido', 'warning', FALSE),
('-41520', 'Código expirado', 'El código ha expirado', 'warning', FALSE),
('-41523', 'Error al enviar código de verificación', 'No se pudo enviar el SMS', 'error', TRUE),
('-41529', 'Usuario o contraseña incorrectos', 'Credenciales inválidas', 'warning', FALSE),
('-41530', 'Tiempo de conexión RADIUS excedido', 'El servidor RADIUS no responde', 'error', TRUE),
('-43408', 'Configuración LDAP inválida', 'Error en configuración del servidor LDAP', 'critical', FALSE),
('-43409', 'Credenciales LDAP inválidas', 'Error de autenticación LDAP', 'error', FALSE);

-- Usuario administrador de ejemplo
-- (Hash de contraseña debe ser generado en aplicación)
INSERT INTO users (phone_number, is_active) VALUES
('+584120000000', TRUE);

-- Índices adicionales para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_transactions_client_phone ON transactions(client_mac, phone_number);
CREATE INDEX IF NOT EXISTS idx_sessions_client_active ON wifi_sessions(client_mac, status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(created_at);