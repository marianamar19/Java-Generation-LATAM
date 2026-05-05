-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Niveles de disponibilidad
INSERT INTO niveles_disponibilidad (id, codigo, nombre, color_hex, orden) VALUES
(1, 'green', 'En existencia', '#2e7d32', 1),
(2, 'yellow', 'Disponibilidad limitada', '#ed6c02', 2),
(3, 'red', 'Pieza exclusiva', '#d32f2f', 3);

-- Géneros
INSERT INTO generos (id, nombre) VALUES
(1, 'masculino'),
(2, 'femenino'),
(3, 'unisex');

-- Familias olfativas
INSERT INTO familias_olfativas (id, nombre, descripcion, orden) VALUES
(1, 'floral', 'Notas de flores frescas o secas', 1),
(2, 'oriental', 'Notas cálidas, especiadas y resinosas', 2),
(3, 'amaderado', 'Notas de maderas secas y nobles', 3),
(4, 'fresco', 'Notas cítricas, acuáticas y verdes', 4),
(5, 'gourmand', 'Notas dulces comestibles (vainilla, caramelo)', 5);

-- Temporadas
INSERT INTO temporadas (id, nombre, orden) VALUES
(1, 'primavera', 1),
(2, 'verano', 2),
(3, 'otoño', 3),
(4, 'invierno', 4);

-- Ocasiones
INSERT INTO ocasiones (id, nombre, icono, orden) VALUES
(1, 'cita', 'heart', 1),
(2, 'oficina', 'briefcase', 2),
(3, 'casual', 'user', 3),
(4, 'gym', 'dumbbell', 4),
(5, 'gala', 'star', 5),
(6, 'playa', 'umbrella', 6);

-- Momentos del día
INSERT INTO momentos_dia (id, nombre, orden) VALUES
(1, 'dia', 1),
(2, 'noche', 2);

-- Notas olfativas
INSERT INTO notas_olfativas (id, nombre, tipo, orden) VALUES
(1, 'Lavanda', 'salida', 1),
(2, 'Bergamota', 'salida', 2),
(3, 'Pimienta', 'salida', 3),
(4, 'Geranio', 'corazon', 1),
(5, 'Vetiver', 'corazon', 2),
(6, 'Sándalo', 'base', 1),
(7, 'Ámbar', 'base', 2),
(8, 'Vainilla', 'base', 3);

-- Acordes
INSERT INTO acordes (id, nombre, orden) VALUES
(1, 'Amaderado', 1),
(2, 'Cítrico', 2),
(3, 'Especiado', 3),
(4, 'Floreal', 4),
(5, 'Dulce', 5);

-- Marcas
INSERT INTO marcas (nombre, slug, pais_origen, es_marca_propia) VALUES
('Jenny Rivera', 'jenny-rivera', 'México', FALSE),
('Abercrombie & Fitch', 'abercrombie', 'USA', FALSE),
('HERA Exclusivo', 'hera-exclusivo', 'México', TRUE),
('HERA Árabe', 'hera-arabe', 'Emiratos Árabes', TRUE),
('Dior', 'dior', 'Francia', FALSE),
('Byredo', 'byredo', 'Suecia', FALSE),
('HERA Joyería', 'hera-joyeria', 'México', TRUE);

-- Categorías
INSERT INTO categorias (nombre, slug, tipo, orden) VALUES
('Diseñador', 'disenador', 'perfumes', 1),
('Nicho', 'nicho', 'perfumes', 2),
('Árabes', 'arabes', 'perfumes', 3),
('Body Mist', 'body-mist', 'perfumes', 4),
('Anillos', 'anillos', 'joyeria', 1),
('Aretes', 'aretes', 'joyeria', 2),
('Collares', 'collares', 'joyeria', 3),
('Brazaletes', 'brazaletes', 'joyeria', 4);

-- Usuario admin (contraseña: admin123 en Base64 = YWRtaW4xMjM=)
INSERT INTO usuarios (nombre, email, contrasena_hash, rol, telefono) VALUES
('Administrador HERA', 'admin@hera.com', '$2a$10$N.ZuP2gMjJz.8XxXxXxXxO5x7N5c5tN5c5tN5c5t', 'ADMIN', '+52 33 1005 0843');

-- Códigos promocionales
INSERT INTO codigos_promocionales (codigo, tipo, valor, activo) VALUES
('HERA10', 'porcentaje', 10, TRUE),
('HERA20', 'porcentaje', 20, TRUE);

-- Configuración
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('envio_gratis_minimo', '1500', 'Monto mínimo para envío gratis en MXN'),
('costo_envio_estandar', '99', 'Costo de envío estándar en MXN'),
('costo_envio_dhl', '149', 'Costo de envío DHL en MXN'),
('whatsapp_numero', '5213310050843', 'Número de WhatsApp de HERA'),
('email_contacto', 'hola@heraperfumes.com', 'Email de contacto del negocio');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ Base de datos HERA Normalizada creada exitosamente' AS Status;
SELECT COUNT(*) AS TotalTablas FROM information_schema.tables WHERE table_schema = 'hera_db';
