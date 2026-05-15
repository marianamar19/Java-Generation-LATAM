/**
 * config.js - Configuración central del proyecto HERA
 * ============================================================
 */

// Detectar si estamos en desarrollo local
const isDevelopment = window.location.hostname === 'localhost'
                   || window.location.hostname === '127.0.0.1';

// En desarrollo: backend en puerto 8080
// En producción: usar la IP de AWS
const API_BASE_URL = isDevelopment
    ? 'http://localhost:8080'                    // Desarrollo local
    : window.location.origin;                     // AWS (la IP pública)

console.log('API_BASE_URL:', API_BASE_URL);

export { API_BASE_URL };