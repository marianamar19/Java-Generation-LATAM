-- =====================================================
-- HERA BD
-- Con tablas catálogo para escalabilidad
-- Talas noramalizadas
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS hera_db;
CREATE DATABASE hera_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hera_db;

-- =====================================================
-- TABLAS CATÁLOGO (PARÁMETROS) - SIN FK
-- =====================================================

-- Niveles de disponibilidad
CREATE TABLE niveles_disponibilidad (
    id INT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    orden INT DEFAULT 0
);

-- Géneros
CREATE TABLE generos (
    id INT PRIMARY KEY,
    nombre VARCHAR(20) UNIQUE NOT NULL
);

-- Familias olfativas
CREATE TABLE familias_olfativas (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT NULL,
    orden INT DEFAULT 0
);

-- Temporadas
CREATE TABLE temporadas (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    orden INT DEFAULT 0
);

-- Ocasiones
CREATE TABLE ocasiones (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    icono VARCHAR(50) NULL,
    orden INT DEFAULT 0
);

-- Momentos del día
CREATE TABLE momentos_dia (
    id INT PRIMARY KEY,
    nombre VARCHAR(20) UNIQUE NOT NULL,
    orden INT DEFAULT 0
);

-- Atributos dinámicos (para cualquier propiedad extra)
CREATE TABLE atributos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto',
    activo BOOLEAN DEFAULT TRUE
);

-- Notas olfativas
CREATE TABLE notas_olfativas (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo ENUM('salida', 'corazon', 'base') NOT NULL,
    orden INT DEFAULT 0
);

-- Acordes
CREATE TABLE acordes (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    orden INT DEFAULT 0
);

-- =====================================================
-- USUARIOS Y AUTENTICACIÓN
-- =====================================================

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER',
    proveedor_auth VARCHAR(20) DEFAULT 'local',
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_rol (rol)
);

CREATE TABLE direcciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    alias VARCHAR(50) NOT NULL,
    nombre_destinatario VARCHAR(100) NOT NULL,
    calle_numero VARCHAR(150) NOT NULL,
    numero_interior VARCHAR(20),
    colonia VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    telefono_contacto VARCHAR(20),
    es_predeterminada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_direcciones_usuario (usuario_id)
);

CREATE TABLE sesiones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token_jwt VARCHAR(500) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_sesiones_usuario (usuario_id),
    INDEX idx_sesiones_token (token_jwt(255))
);

-- =====================================================
-- CATÁLOGO BASE
-- =====================================================

CREATE TABLE marcas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    pais_origen VARCHAR(100),
    descripcion TEXT,
    logo_url VARCHAR(500),
    es_marca_propia BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_marcas_slug (slug)
);

CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    categoria_padre_id BIGINT,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_categorias_tipo (tipo),
    INDEX idx_categorias_slug (slug)
);

-- =====================================================
-- PRODUCTOS
-- =====================================================

CREATE TABLE productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) UNIQUE,
    slug VARCHAR(150) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    marca_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    badge VARCHAR(50),
    nivel_disponibilidad_id INT NOT NULL,
    genero_id INT,
    familia_olfativa_id INT,
    descripcion TEXT,
    perfumista VARCHAR(150),
    anio_lanzamiento INT,
    pais_origen VARCHAR(100),
    imagen_principal_url VARCHAR(500),
    imagenes_extra JSON,
    es_nuevo BOOLEAN DEFAULT FALSE,
    es_best_seller BOOLEAN DEFAULT FALSE,
    es_destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (nivel_disponibilidad_id) REFERENCES niveles_disponibilidad(id),
    FOREIGN KEY (genero_id) REFERENCES generos(id),
    FOREIGN KEY (familia_olfativa_id) REFERENCES familias_olfativas(id),
    
    INDEX idx_productos_product_id (product_id),
    INDEX idx_productos_tipo (tipo),
    INDEX idx_productos_slug (slug),
    INDEX idx_productos_nivel (nivel_disponibilidad_id),
    FULLTEXT INDEX idx_productos_busqueda (nombre, descripcion)
);

-- =====================================================
-- RENDIMIENTO DE PRODUCTOS
-- =====================================================

CREATE TABLE producto_rendimiento (
    producto_id BIGINT PRIMARY KEY,
    longevidad INT,
    estela INT,
    puntuacion_general DECIMAL(3,2),
    total_resenas INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- =====================================================
-- VARIANTES
-- =====================================================

CREATE TABLE variantes_producto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    sku VARCHAR(100) UNIQUE,
    nombre_variante VARCHAR(100) NOT NULL,
    etiqueta_tipo VARCHAR(50) DEFAULT 'Presentación',
    precio DECIMAL(10,2) NOT NULL,
    precio_descuento DECIMAL(10,2),
    stock INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_variantes_producto (producto_id),
    INDEX idx_variantes_sku (sku)
);

-- =====================================================
-- IMÁGENES
-- =====================================================

CREATE TABLE imagenes_producto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    orden INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_imagenes_producto (producto_id)
);

-- =====================================================
-- RELACIONES N:M
-- =====================================================

-- Producto - Temporadas
CREATE TABLE producto_temporadas (
    producto_id BIGINT,
    temporada_id INT,
    PRIMARY KEY (producto_id, temporada_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (temporada_id) REFERENCES temporadas(id)
);

-- Producto - Ocasiones
CREATE TABLE producto_ocasiones (
    producto_id BIGINT,
    ocasion_id INT,
    PRIMARY KEY (producto_id, ocasion_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (ocasion_id) REFERENCES ocasiones(id)
);

-- Producto - Momentos del día
CREATE TABLE producto_momentos_dia (
    producto_id BIGINT,
    momento_id INT,
    PRIMARY KEY (producto_id, momento_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (momento_id) REFERENCES momentos_dia(id)
);

-- Producto - Notas olfativas
CREATE TABLE producto_notas (
    producto_id BIGINT,
    nota_id INT,
    PRIMARY KEY (producto_id, nota_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (nota_id) REFERENCES notas_olfativas(id)
);

-- Producto - Acordes
CREATE TABLE producto_acordes (
    producto_id BIGINT,
    acorde_id INT,
    intensidad INT,
    PRIMARY KEY (producto_id, acorde_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (acorde_id) REFERENCES acordes(id)
);

-- Atributos dinámicos por producto
CREATE TABLE producto_atributos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    atributo_id BIGINT NOT NULL,
    valor VARCHAR(255),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (atributo_id) REFERENCES atributos(id),
    UNIQUE KEY uk_producto_atributo (producto_id, atributo_id)
);

-- =====================================================
-- CARRITO
-- =====================================================

CREATE TABLE carritos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    carrito_token VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_carritos_usuario (usuario_id),
    INDEX idx_carritos_token (carrito_token)
);

CREATE TABLE carrito_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrito_id BIGINT NOT NULL,
    variante_id BIGINT NOT NULL,
    cantidad INT DEFAULT 1,
    UNIQUE KEY uk_carrito_variante (carrito_id, variante_id),
    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES variantes_producto(id)
);

CREATE TABLE favoritos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_producto (usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- =====================================================
-- CÓDIGOS PROMOCIONALES (MOVIDO ANTES DE PEDIDOS - IMPORTANTE)
-- =====================================================

CREATE TABLE codigos_promocionales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    usos_maximos INT,
    usos_actuales INT DEFAULT 0,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    INDEX idx_codigos_activo (activo)
);

-- =====================================================
-- PEDIDOS (AHORA codigos_promocionales YA EXISTE)
-- =====================================================

CREATE TABLE pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id BIGINT,
    nombre_contacto VARCHAR(150) NOT NULL,
    email_contacto VARCHAR(150) NOT NULL,
    telefono_contacto VARCHAR(20),
    direccion_calle VARCHAR(150) NOT NULL,
    direccion_colonia VARCHAR(100) NOT NULL,
    direccion_ciudad VARCHAR(100) NOT NULL,
    direccion_estado VARCHAR(50) NOT NULL,
    direccion_cp VARCHAR(10) NOT NULL,
    metodo_envio VARCHAR(50) NOT NULL,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    metodo_pago VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    codigo_promocional_id BIGINT,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion DATETIME,
    fecha_envio DATETIME,
    fecha_entrega DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (codigo_promocional_id) REFERENCES codigos_promocionales(id),
    
    INDEX idx_pedidos_numero (numero_pedido),
    INDEX idx_pedidos_usuario (usuario_id),
    INDEX idx_pedidos_estado (estado)
);

CREATE TABLE detalles_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    variante_id BIGINT NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES variantes_producto(id),
    INDEX idx_detalles_pedido (pedido_id)
);

-- =====================================================
-- RESEÑAS
-- =====================================================

CREATE TABLE resenas_producto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    usuario_id BIGINT,
    calificacion INT NOT NULL,
    comentario TEXT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprobada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_resenas_producto (producto_id),
    INDEX idx_resenas_aprobada (aprobada)
);

-- =====================================================
-- CONTACTO
-- =====================================================

CREATE TABLE contactos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    asunto VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contactos_leido (leido)
);

CREATE TABLE suscriptores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_suscripcion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONFIGURACIÓN
-- =====================================================

CREATE TABLE configuracion (
    clave VARCHAR(100) PRIMARY KEY,
    valor VARCHAR(500) NOT NULL,
    descripcion VARCHAR(200),
    fecha_actualizacion DATETIME ON UPDATE CURRENT_TIMESTAMP
);


-- =====================================================
-- FIN
-- =====================================================